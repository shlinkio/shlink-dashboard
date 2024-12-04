import type { ProblemDetailsError } from '@shlinkio/shlink-js-sdk/api-contract';

export const empty = () => new Response(null, { status: 204 });

export const problemDetails = (errorPayload: ProblemDetailsError) => Response.json(
  errorPayload,
  { status: errorPayload.status },
);
