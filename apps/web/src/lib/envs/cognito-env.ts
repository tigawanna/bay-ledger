/** Browser Cognito config. Values come from apps/web/.env (VITE_*). */

export const cognitoEnv = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
  region: import.meta.env.VITE_COGNITO_REGION,
  /** Empty in prod → real AWS. Set locally to Floci (`http://localhost:4566`). */
  endpoint: import.meta.env.VITE_AWS_ENDPOINT_URL || undefined,
} as const;
