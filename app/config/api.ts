
// API Configuration
export const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const apiURL = baseURL + '/api';
// Navigation Routes
export const ROUTES = {
  SEARCH: apiURL + '/search/hybrid',
  FILTER: apiURL + '/search/filter'
} as const;
