import { ActionFunctionArgs, json } from '@remix-run/node';
import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { NodeHttpClient } from '@shlinkio/shlink-js-sdk/node';

export async function action({ params, request }: ActionFunctionArgs) {
  const client = new ShlinkApiClient(new NodeHttpClient(), {
    apiKey: '',
    baseUrl: '',
  });
  const action = params.action as keyof ShlinkApiClient;
  const { args }: { args: unknown[] } = await request.json();
  const response = await client[action](...args);

  return json(response);
}
