import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useLocation, useParams } from '@remix-run/react';
import type { Settings } from '@shlinkio/shlink-web-component/settings';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ShlinkApiProxyClient } from '../api/ShlinkApiProxyClient.client';
import { AuthHelper } from '../auth/auth-helper.server';
import { serverContainer } from '../container/container.server';
import { SettingsService } from '../settings/SettingsService.server';
import { TagsService } from '../tags/TagsService.server';
import { TagsStorage } from '../tags/TagsStorage.client';

export async function loader(
  { request, params }: LoaderFunctionArgs,
  tagsService: TagsService = serverContainer[TagsService.name],
  settingsService: SettingsService = serverContainer[SettingsService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
): Promise<{ settings: Settings; tagColors: Record<string, string> }> {
  const { serverId: serverPublicId } = params;
  const { userId } = await authHelper.getSession(request, '/login');
  const [tagColors, settings] = await Promise.all([
    tagsService.tagColors({ userId, serverPublicId }),
    settingsService.userSettings(userId),
  ]);

  return { settings, tagColors };
}

export default function ShlinkWebComponentContainer() {
  const [component, setComponent] = useState<ReactNode>(null);
  const { settings, tagColors } = useLoaderData<typeof loader>();
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
          tagColorsStorage={new TagsStorage(tagColors, `${prefix}/tags/colors`)}
        />,
      );
    });
  }, [prefix, serverId, settings, tagColors]);

  return component;
}
