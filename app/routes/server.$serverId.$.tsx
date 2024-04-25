import { useLoaderData, useLocation, useParams } from '@remix-run/react';
import type { Settings } from '@shlinkio/shlink-web-component';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ShlinkApiProxyClient } from '../api/ShlinkApiProxyClient';

export async function loader(): Promise<Settings> {
  return {};
}

export default function ShlinkWebComponentContainer() {
  const [component, setComponent] = useState<ReactNode>(null);
  const settings = useLoaderData<ReturnType<typeof loader>>();
  const params = useParams();
  const { serverId } = params;
  const { pathname } = useLocation();
  const prefix = useMemo(() => {
    const rest = params['*'] ?? '';
    const [pathPrefix] = pathname.split(rest);

    return pathPrefix.endsWith('/') ? pathPrefix.slice(0, -1) : pathPrefix;
  }, [params, pathname]);

  useEffect(() => {
    if (!serverId) {
      return;
    }

    const apiClient = new ShlinkApiProxyClient(serverId);
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
          settings={settings}
          // tagColorsStorage={} // TODO
        />,
      );
    });
  }, [prefix, serverId, settings]);

  return component;
}
