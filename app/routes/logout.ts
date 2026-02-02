import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { AuthHelper } from '../auth/auth-helper.server';
import { getLogoutUrl, isOidcEnabled } from '../auth/oidc.server';
import { serverContainer } from '../container/container.server';

export async function loader(
  { request }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  // Destroy local session first
  const logoutResponse = await authHelper.logout(request);

  // If OIDC is enabled, redirect to Authentik's end_session_endpoint
  if (isOidcEnabled()) {
    const oidcLogoutUrl = await getLogoutUrl();
    if (oidcLogoutUrl) {
      // Preserve the Set-Cookie header to destroy the session
      const setCookie = logoutResponse.headers.get('Set-Cookie');
      const headers: HeadersInit = {};
      if (setCookie) {
        headers['Set-Cookie'] = setCookie;
      }
      return redirect(oidcLogoutUrl, { headers });
    }
  }

  return logoutResponse;
}
