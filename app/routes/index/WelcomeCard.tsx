import { Card } from '@shlinkio/shlink-frontend-kit/tailwind';
import clsx from 'clsx';
import type { FC } from 'react';
import { ShlinkLogo } from '../../common/ShlinkLogo';
import type { PlainServer } from '../../entities/Server';
import { NoServers } from './NoServers';
import { ServersList } from './ServersList';

export type WelcomeCardProps = {
  servers: PlainServer[];
};

export const WelcomeCard: FC<WelcomeCardProps> = ({ servers }) => (
  <Card className="tw:flex tw:justify-stretch">
    <div className={clsx(
      'tw:w-4/12 tw:hidden tw:md:flex tw:items-center p-3',
      'tw:border-r tw:border-r-lm-border tw:dark:border-r-dm-border',
    )}>
      <ShlinkLogo />
    </div>
    <div className="tw:md:w-8/12 tw:w-full">
      <h1
        className="tw:px-5 tw:py-6 tw:mb-0 tw:text-center tw:border-b tw:border-b-lm-border tw:dark:border-b-dm-border"
      >
        Welcome!
      </h1>
      {servers.length > 0 ? <ServersList servers={servers} /> : <NoServers />}
    </div>
  </Card>
);
