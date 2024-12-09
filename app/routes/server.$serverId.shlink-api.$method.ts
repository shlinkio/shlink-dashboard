import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { ErrorType } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ActionFunctionArgs } from 'react-router';
import type { ApiClientBuilder } from '../api/apiClientBuilder.server';
import { AuthHelper } from '../auth/auth-helper.server';
import { serverContainer } from '../container/container.server';
import { ServersService } from '../servers/ServersService.server';
import { problemDetails } from '../utils/response.server';

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

function resolveApiMethod(client: ShlinkApiClient, method?: string): Callback | undefined {
  if (!method || !actionInApiClient(method, client)) {
    return undefined;
  }

  const apiMethod = client[method];
  return actionIsCallback(apiMethod) ? apiMethod : undefined;
}

export async function action(
  { params, request }: ActionFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
  createApiClient: ApiClientBuilder = serverContainer.apiClientBuilder,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  console_ = console,
) {
  const sessionData = await authHelper.getSession(request);
  if (!sessionData) {
    return problemDetails({
      status: 403,
      type: 'https://shlink.io/api/error/access-denied',
      title: 'Access denied',
      detail: 'You need to log-in to fetch data from Shlink',
    });
  }

  const { userId } = sessionData;
  const { method, serverId = '' } = params;
  let server;
  try {
    server = await serversService.getByPublicIdAndUser(serverId, userId);
  } catch {
    return problemDetails({
      status: 404,
      type: ErrorType.NOT_FOUND,
      title: 'Server not found',
      detail: `Server with ID ${serverId} not found`,
      serverId,
    });
  }

  const client = createApiClient(server);
  const apiMethod = resolveApiMethod(client, method);
  if (!apiMethod) {
    return problemDetails({
      status: 404,
      type: ErrorType.NOT_FOUND,
      title: 'Action not found',
      detail: `The ${method} action is not a valid Shlink SDK method`,
      method,
    });
  }

  const { args } = await request.json();
  if (!args || !Array.isArray(args) || !argsAreValidForAction(args, apiMethod)) {
    return problemDetails({
      status: 400,
      type: 'https://shlink.io/api/error/invalid-arguments',
      title: 'Invalid arguments',
      detail: `Provided arguments are not valid for ${method} action`,
      args,
      method,
    });
  }

  try {
    const response = await apiMethod.bind(client)(...args as Parameters<typeof apiMethod>);
    return Response.json(response);
  } catch (e) {
    console_.error(e);
    return problemDetails({
      status: 500,
      type: 'https://shlink.io/api/error/internal-server-error',
      title: 'Unexpected error',
      detail: 'An unexpected error occurred while calling Shlink API',
    });
  }
}
