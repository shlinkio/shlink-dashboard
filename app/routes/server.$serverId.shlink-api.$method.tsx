import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { NodeHttpClient } from '@shlinkio/shlink-js-sdk/node';
import { readFileSync } from 'node:fs';

type Callback = (...args: unknown[]) => unknown;

function actionInApiClient(method: string, client: ShlinkApiClient): method is keyof typeof client {
  return method in client;
}

function actionIsCallback(method: any): method is Callback {
  return typeof method === 'function';
}

function argsAreValidForAction(args: any[], callback: Callback): args is Parameters<typeof callback> {
  return args.length >= callback.length;
}

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { method, serverId } = params;
    // TODO Read credentials from database
    const credentials = JSON.parse(readFileSync(`./credentials.${serverId}.json`).toString());

    const client = new ShlinkApiClient(new NodeHttpClient(), credentials);
    if (!method || !actionInApiClient(method, client)) {
      return json({}, 404); // TODO Return some useful info in Problem Details format
    }

    const apiMethod = client[method];
    if (!actionIsCallback(apiMethod)) {
      return json({}, 404); // TODO Return some useful info in Problem Details format
    }

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
