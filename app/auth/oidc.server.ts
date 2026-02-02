import * as client from 'openid-client';
import type { Role } from '../entities/User';
import { getOidcConfig, isOidcEnabled } from '../utils/env.server';

export interface OidcClaims {
  sub: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  groups?: string[];
}

interface OidcState {
  state: string;
  nonce: string;
  codeVerifier: string;
}

let cachedConfig: client.Configuration | null = null;

async function getOidcClientConfig(): Promise<client.Configuration> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const config = getOidcConfig();
  if (!config) {
    throw new Error('OIDC is not enabled');
  }

  cachedConfig = await client.discovery(
    new URL(config.issuerUrl),
    config.clientId,
    config.clientSecret,
  );

  return cachedConfig;
}

export function generateOidcState(): OidcState {
  return {
    state: client.randomState(),
    nonce: client.randomNonce(),
    codeVerifier: client.randomPKCECodeVerifier(),
  };
}

export async function buildAuthorizationUrl(oidcState: OidcState): Promise<string> {
  const oidcConfig = getOidcConfig();
  if (!oidcConfig) {
    throw new Error('OIDC is not enabled');
  }

  const clientConfig = await getOidcClientConfig();
  const codeChallenge = await client.calculatePKCECodeChallenge(oidcState.codeVerifier);

  const parameters: Record<string, string> = {
    redirect_uri: oidcConfig.redirectUri,
    scope: oidcConfig.scopes,
    state: oidcState.state,
    nonce: oidcState.nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  };

  return client.buildAuthorizationUrl(clientConfig, parameters).href;
}

export async function exchangeCodeForTokens(
  code: string,
  state: string,
  expectedState: string,
  nonce: string,
  codeVerifier: string,
): Promise<OidcClaims> {
  if (state !== expectedState) {
    throw new Error('Invalid state parameter');
  }

  const oidcConfig = getOidcConfig();
  if (!oidcConfig) {
    throw new Error('OIDC is not enabled');
  }

  const clientConfig = await getOidcClientConfig();

  const currentUrl = new URL(oidcConfig.redirectUri);
  currentUrl.searchParams.set('code', code);
  currentUrl.searchParams.set('state', state);

  const tokens = await client.authorizationCodeGrant(clientConfig, currentUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedNonce: nonce,
    expectedState,
  });

  const claims = tokens.claims();
  if (!claims) {
    throw new Error('No claims in ID token');
  }

  // Explicit token validation - don't rely solely on openid-client
  const now = Math.floor(Date.now() / 1000);
  const clockSkewSeconds = 60; // Allow 60 seconds of clock skew

  // Verify token expiration
  if (claims.exp && claims.exp < now - clockSkewSeconds) {
    throw new Error('ID token has expired');
  }

  // Verify token was not issued too far in the future
  if (claims.iat && claims.iat > now + clockSkewSeconds) {
    throw new Error('ID token issued in the future');
  }

  // Verify nonce matches (secondary validation)
  if (claims.nonce !== nonce) {
    throw new Error('ID token nonce mismatch');
  }

  // Extract groups from the token - could be in id_token claims or access_token
  let groups: string[] = [];
  if (claims.groups && Array.isArray(claims.groups)) {
    groups = claims.groups as string[];
  }

  return {
    sub: claims.sub,
    email: claims.email as string | undefined,
    preferred_username: claims.preferred_username as string | undefined,
    name: claims.name as string | undefined,
    groups,
  };
}

export function mapGroupsToRole(groups: string[]): Role {
  const oidcConfig = getOidcConfig();
  if (!oidcConfig) {
    return 'managed-user';
  }

  // Check for admin group first
  if (oidcConfig.adminGroup && groups.includes(oidcConfig.adminGroup)) {
    return 'admin';
  }

  // Check for advanced group
  if (oidcConfig.advancedGroup && groups.includes(oidcConfig.advancedGroup)) {
    return 'advanced-user';
  }

  // Fall back to default role
  return oidcConfig.defaultRole as Role;
}

export async function getLogoutUrl(idTokenHint?: string): Promise<string | null> {
  const oidcConfig = getOidcConfig();
  if (!oidcConfig) {
    return null;
  }

  try {
    const clientConfig = await getOidcClientConfig();
    const serverMetadata = clientConfig.serverMetadata();

    if (!serverMetadata.end_session_endpoint) {
      return null;
    }

    const logoutUrl = new URL(serverMetadata.end_session_endpoint);

    if (idTokenHint) {
      logoutUrl.searchParams.set('id_token_hint', idTokenHint);
    }

    // Post-logout redirect back to our login page
    const postLogoutUri = new URL(oidcConfig.redirectUri);
    postLogoutUri.pathname = '/login';
    logoutUrl.searchParams.set('post_logout_redirect_uri', postLogoutUri.origin + '/login');

    return logoutUrl.href;
  } catch {
    return null;
  }
}

export { isOidcEnabled };
