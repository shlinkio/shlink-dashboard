import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { NodeHttpClient } from '@shlinkio/shlink-js-sdk/node';
import type { Server } from '../entities/Server';

const apiClients = new Map<string, ShlinkApiClient>();

export const apiClientBuilder = (server: Server) => {
  const key = `${server.apiKey}_${server.baseUrl}`;
  const existingApiClient = apiClients.get(key);

  if (existingApiClient) {
    return existingApiClient;
  }

  const apiClient = new ShlinkApiClient(new NodeHttpClient(), server);
  apiClients.set(key, apiClient);
  return apiClient;
};

export type ApiClientBuilder = typeof apiClientBuilder;
