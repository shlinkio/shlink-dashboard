import { ActionFunctionArgs, json } from '@remix-run/node';
import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { NodeHttpClient } from '@shlinkio/shlink-js-sdk/node';

function actionIsShlinkApiMethod(action: string, client: ShlinkApiClient): action is keyof typeof client {
  return action in client;
}

export async function action({ params, request }: ActionFunctionArgs) {
  const client = new ShlinkApiClient(new NodeHttpClient(), {
    apiKey: '',
    baseUrl: '',
  });
  const action = params.action;
  if (!action || !actionIsShlinkApiMethod(action, client)) {
    return json({}, 404);
  }

  try {
    const { args } = await request.json();
    if (!args || !Array.isArray(args)) {
      return json({}, 400);
    }

    const response = await client[action](...args);

    return json(response);
  } catch {
    return json({}, 400);
  }
}
