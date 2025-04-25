/**
 * Returns a URLSearchParams object with the query parameters for provided request
 */
export const requestQueryParams = (request: Request): URLSearchParams => new URL(request.url).searchParams;

/**
 * Returns a specific query parameter for provided request
 */
export const requestQueryParam = (request: Request, param: string) => requestQueryParams(request).get(param);
