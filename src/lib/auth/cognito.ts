import "server-only";

export const cognitoConfig = {
  region: process.env.COGNITO_REGION,
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  domain: process.env.COGNITO_DOMAIN,
  redirectUri: process.env.COGNITO_REDIRECT_URI,
  logoutRedirectUri: process.env.COGNITO_LOGOUT_REDIRECT_URI,
} as const;

function requireConfig(key: keyof typeof cognitoConfig): string {
  const value = cognitoConfig[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getCognitoDomain(): string {
  const domain = requireConfig("domain");
  return domain.replace(/\/$/, "");
}

export function getIssuer(): string {
  const region = requireConfig("region");
  const userPoolId = requireConfig("userPoolId");
  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

export function getJwksUri(): string {
  return `${getIssuer()}/.well-known/jwks.json`;
}

export function getAuthorizeUrl(): string {
  return `${getCognitoDomain()}/oauth2/authorize`;
}

export function getTokenUrl(): string {
  return `${getCognitoDomain()}/oauth2/token`;
}

export function getLogoutUrl(): string {
  return `${getCognitoDomain()}/logout`;
}

export function getClientId(): string {
  return requireConfig("clientId");
}

export function getRedirectUri(): string {
  return requireConfig("redirectUri");
}

export function getLogoutRedirectUri(): string {
  return requireConfig("logoutRedirectUri");
}
