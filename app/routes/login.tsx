import { Button, LabelledInput, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect, useFetcher, useLoaderData, useSearchParams } from 'react-router';
import { AuthHelper } from '../auth/auth-helper.server';
import { buildAuthorizationUrl, generateOidcState, isOidcEnabled } from '../auth/oidc.server';
import { CenteredContentLayout } from '../common/CenteredContentLayout';
import { serverContainer } from '../container/container.server';
import { getOidcProviderName, isLocalAuthEnabled, isProd } from '../utils/env.server';
import { requestQueryParam } from '../utils/request.server';

const INCORRECT_CREDENTIAL_ERROR_PREFIXES = ['Incorrect password', 'User not found'];
const OIDC_STATE_COOKIE = 'oidc_state';

function buildOidcStateCookie(stateCookie: string): string {
  const secureFlag = isProd() ? 'Secure; ' : '';
  return `${OIDC_STATE_COOKIE}=${encodeURIComponent(stateCookie)}; Path=/; ${secureFlag}HttpOnly; SameSite=Lax; Max-Age=600`;
}

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  // If the user is already authenticated, redirect to home
  const isAuthenticated = await authHelper.isAuthenticated(request);
  if (isAuthenticated) {
    return redirect('/');
  }

  const oidcEnabled = isOidcEnabled();
  const localAuthEnabled = isLocalAuthEnabled();

  // If OIDC is enabled and local auth is disabled, auto-redirect to OIDC
  if (oidcEnabled && !localAuthEnabled) {
    const redirectTo = requestQueryParam(request, 'redirect-to');
    const oidcState = generateOidcState();
    const authUrl = await buildAuthorizationUrl(oidcState);

    // Store state in cookie for callback verification
    const stateCookie = JSON.stringify({
      state: oidcState.state,
      nonce: oidcState.nonce,
      codeVerifier: oidcState.codeVerifier,
      redirectTo,
    });

    return redirect(authUrl, {
      headers: {
        'Set-Cookie': buildOidcStateCookie(stateCookie),
      },
    });
  }

  const oidcProviderName = getOidcProviderName();
  return { oidcEnabled, localAuthEnabled, oidcProviderName };
}

export async function action(
  { request }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const formData = await request.clone().formData();
  const intent = formData.get('intent');

  // Handle OIDC login initiation
  if (intent === 'oidc') {
    if (!isOidcEnabled()) {
      return { error: true, message: 'OIDC is not enabled' };
    }

    const redirectTo = formData.get('redirect-to')?.toString();
    const oidcState = generateOidcState();
    const authUrl = await buildAuthorizationUrl(oidcState);

    const stateCookie = JSON.stringify({
      state: oidcState.state,
      nonce: oidcState.nonce,
      codeVerifier: oidcState.codeVerifier,
      redirectTo,
    });

    return redirect(authUrl, {
      headers: {
        'Set-Cookie': buildOidcStateCookie(stateCookie),
      },
    });
  }

  // Handle local auth login
  try {
    return await authHelper.login(request);
  } catch (e: any) {
    // TODO Use a more robust way to detect errors
    if (INCORRECT_CREDENTIAL_ERROR_PREFIXES.some((prefix) => e.message.startsWith(prefix))) {
      return { error: true };
    }

    throw e;
  }
}

export default function Login() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [searchParams] = useSearchParams();
  const isSaving = fetcher.state === 'submitting';

  const oidcEnabled = loaderData && 'oidcEnabled' in loaderData && loaderData.oidcEnabled;
  const localAuthEnabled = loaderData && 'localAuthEnabled' in loaderData && loaderData.localAuthEnabled;
  const oidcProviderName = loaderData && 'oidcProviderName' in loaderData ? loaderData.oidcProviderName : 'SSO';
  const errorParam = searchParams.get('error');
  const redirectTo = searchParams.get('redirect-to');

  return (
    <CenteredContentLayout>
      <SimpleCard>
        <div className="flex flex-col gap-4">
          {/* OIDC Login Button */}
          {oidcEnabled && (
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="oidc" />
              {redirectTo && <input type="hidden" name="redirect-to" value={redirectTo} />}
              <Button solid type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? 'Redirecting...' : `Sign in with ${oidcProviderName}`}
              </Button>
            </fetcher.Form>
          )}

          {/* Separator when both auth methods are available */}
          {oidcEnabled && localAuthEnabled && (
            <div className="flex items-center gap-4">
              <hr className="flex-1 border-gray-300" />
              <span className="text-gray-500 text-sm">or</span>
              <hr className="flex-1 border-gray-300" />
            </div>
          )}

          {/* Local Auth Form */}
          {localAuthEnabled && (
            <fetcher.Form method="post" className="flex flex-col gap-4">
              <LabelledInput label="Username:" name="username" hiddenRequired />
              <LabelledInput label="Password:" type="password" name="password" hiddenRequired />
              <Button solid type="submit" disabled={isSaving}>
                {isSaving ? 'Logging in...' : 'Login'}
              </Button>
            </fetcher.Form>
          )}

          {/* Error messages */}
          {fetcher.data && 'error' in fetcher.data && fetcher.data.error && (
            <div className="text-danger">
              {'message' in fetcher.data && fetcher.data.message
                ? String(fetcher.data.message)
                : 'Username or password are incorrect'}
            </div>
          )}
          {errorParam && (
            <div className="text-danger">
              Authentication error: {errorParam}
            </div>
          )}
        </div>
      </SimpleCard>
    </CenteredContentLayout>
  );
}
