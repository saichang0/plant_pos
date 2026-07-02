export const BACKEND_URLS = {
  local: 'http://localhost:5000/graphql',
  network: 'http://10.91.171.208:5000/graphql',
  androidEmulator: 'http://10.0.2.2:5000/graphql',
  // Production (Vultr VPS "greenmarket", Singapore). Nginx proxies port 80 to
  // the backend, so there is no ":5000" here.
  production: 'http://45.77.34.106/graphql',
};

// The URL actually used at runtime. Override per environment with
// NEXT_PUBLIC_GRAPHQL_URL; otherwise default to production.
export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || BACKEND_URLS.production;

// Base URL without the "/graphql" suffix, used for REST endpoints like /upload.
export const API_BASE_URL = GRAPHQL_URL.replace('/graphql', '');
