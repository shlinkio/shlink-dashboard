import { ActionFunctionArgs, json } from '@remix-run/node';
import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { NodeHttpClient } from '@shlinkio/shlink-js-sdk/node';

type Callback = (...args: unknown[]) => unknown;

function actionInApiClient(action: string, client: ShlinkApiClient): action is keyof typeof client {
  return action in client;
}

function actionIsCallback(action: any): action is Callback {
  return typeof action === 'function';
}

function argsAreValidForAction(args: any[], callback: Callback): args is Parameters<typeof callback> {
  return args.length >= callback.length;
}

export async function action({ params, request }: ActionFunctionArgs) {
  const client = new ShlinkApiClient(new NodeHttpClient(), {
    apiKey: '',
    baseUrl: '',
  });
  const action = params.action;
  if (!action || !actionInApiClient(action, client)) {
    return json({}, 404); // TODO Return some useful info in Problem Details format
  }

  const apiMethod = client[action];
  if (!actionIsCallback(apiMethod)) {
    return json({}, 404); // TODO Return some useful info in Problem Details format
  }

  try {
    const { args } = await request.json();
    if (!args || !Array.isArray(args) || !argsAreValidForAction(args, apiMethod)) {
      return json({}, 400); // TODO Return some useful info in Problem Details format
    }

    const response = await apiMethod.bind(client)(...args);

    return json(response);
  } catch {
    return json({}, 500); // TODO Return some useful info in Problem Details format
  }
}
