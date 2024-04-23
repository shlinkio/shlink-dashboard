import { ServerInfo, ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { FetchHttpClient } from '@shlinkio/shlink-js-sdk/browser';
import { ReactNode, useEffect, useState } from 'react';
import { useLoaderData } from '@remix-run/react';

export async function loader(): Promise<ServerInfo> {
  return {
    apiKey: '',
    baseUrl: '',
  };
}

export default function ShlinkWebComponentContainer() {
  const [component, setComponent] = useState<ReactNode>(null);
  const serverInfo = useLoaderData<ReturnType<typeof loader>>();

  useEffect(() => {
    const apiClient = new ShlinkApiClient(new FetchHttpClient(), serverInfo);
    Promise.all([
      // Just by importing shlink-web-component, some dependencies (like `leaflet`) try to access the window object.
      // That won't work while SSRing, so we need to dynamically import as a side effect, which will happen in the
      // client only
      import('@shlinkio/shlink-web-component'),
      apiClient.health(),
    ]).then(([{ ShlinkWebComponent }, { version }]) => {
      setComponent(
        <ShlinkWebComponent serverVersion={version as any} apiClient={apiClient} routesPrefix="/server/123" />
      );
    })
  }, []);

  return component;
}
