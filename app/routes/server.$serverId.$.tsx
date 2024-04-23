import { ServerInfo, ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { FetchHttpClient } from '@shlinkio/shlink-js-sdk/browser';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useLoaderData, useMatches } from '@remix-run/react';
import type { Settings } from '@shlinkio/shlink-web-component';

export async function loader(): Promise<{ server: ServerInfo; settings: Settings }> {
  return {
    server: {
      apiKey: '',
      baseUrl: '',
    },
    settings: {},
  };
}

export default function ShlinkWebComponentContainer() {
  const [component, setComponent] = useState<ReactNode>(null);
  const info = useLoaderData<ReturnType<typeof loader>>();
  const matches = useMatches();
  const prefix = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    if (!currentMatch) {
      return undefined;
    }

    const { params, pathname } = currentMatch;
    const rest = params['*'] ?? '';
    const [pathPrefix] = pathname.split(rest);

    return pathPrefix.endsWith('/') ? pathPrefix.slice(0, -1) : pathPrefix;
  }, [matches]);

  useEffect(() => {
    const apiClient = new ShlinkApiClient(new FetchHttpClient(), info.server);
    Promise.all([
      // Just by importing shlink-web-component, some dependencies (like `leaflet`) try to access the window object.
      // That won't work while SSRing, so we need to dynamically import as a side effect, which will happen in the
      // client only
      import('@shlinkio/shlink-web-component'),
      apiClient.health(),
    ]).then(([{ ShlinkWebComponent }, { version }]) => {
      setComponent(
        <ShlinkWebComponent
          serverVersion={version as any}
          apiClient={apiClient}
          routesPrefix={prefix}
          settings={info.settings}
          // tagColorsStorage={} // TODO
        />
      );
    });
  }, []);

  return component;
}
