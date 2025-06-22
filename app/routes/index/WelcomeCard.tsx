import { Card } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { ShlinkLogo } from '../../common/ShlinkLogo';
import type { PlainServer } from '../../entities/Server';
import { NoServers } from './NoServers';
import { ServersList } from './ServersList';

export type WelcomeCardProps = {
  servers: PlainServer[];
};

export const WelcomeCard: FC<WelcomeCardProps> = ({ servers }) => (
  <Card className="flex justify-stretch">
    <div className={clsx(
      'w-4/12 hidden md:flex items-center p-3',
      'border-r border-r-lm-border dark:border-r-dm-border',
    )}>
      <ShlinkLogo />
    </div>
    <div className="md:w-8/12 w-full">
      <h1
        className="px-5 py-6 mb-0 text-center border-b border-b-lm-border dark:border-b-dm-border"
      >
        Welcome!
      </h1>
      {servers.length > 0 ? <ServersList servers={servers} /> : <NoServers />}
    </div>
  </Card>
);
