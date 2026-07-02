export const BACKEND_URLS = {
  local: 'http://localhost:5000/graphql',
  network: 'http://10.91.171.208:5000/graphql',
  androidEmulator: 'http://10.0.2.2:5000/graphql',
  // Production. Cloudflare + Nginx serve the backend over HTTPS at the
  // api subdomain (Nginx proxies to the Docker container on port 4000).
  production: 'https://api.gremk.online/graphql',
};

// The URL actually used at runtime. Override per environment with
// NEXT_PUBLIC_GRAPHQL_URL; otherwise default to production.
export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || BACKEND_URLS.production;

// Base URL without the "/graphql" suffix, used for REST endpoints like /upload.
export const API_BASE_URL = GRAPHQL_URL.replace('/graphql', '');
