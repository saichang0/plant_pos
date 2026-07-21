
export const GRAPHQL_URL = "http://localhost:5000/graphql";              // local
// export const GRAPHQL_URL = "http://10.239.186.208:5000/graphql";      // local network (phone/other device)
// export const GRAPHQL_URL = "https://api.gremk.online/graphql";        // production

// Base URL without the "/graphql" suffix, used for REST endpoints like /upload.
export const API_BASE_URL = GRAPHQL_URL.replace('/graphql', '');
