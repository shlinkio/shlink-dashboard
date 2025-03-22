import clsx from 'clsx';
import type { FC } from 'react';
import { ShlinkLogo } from '../../common/ShlinkLogo';
import type { Server } from '../../entities/Server';
import { Card } from '../../fe-kit/Card';
import { NoServers } from './NoServers';
import { ServersList } from './ServersList';

export type WelcomeCardProps = {
  servers: Server[];
};

export const WelcomeCard: FC<WelcomeCardProps> = ({ servers }) => (
  <Card className="tw:flex tw:justify-stretch">
    <div className={clsx(
      'tw:w-4/12 tw:hidden tw:md:flex tw:items-center p-3',
      'tw:border-r tw:border-r-(--border-color)',
    )}>
      <ShlinkLogo />
    </div>
    <div className="tw:md:w-8/12 tw:w-full">
      <h1 className="tw:px-5 tw:py-6 tw:mb-0! tw:text-center tw:border-b tw:border-b-(--border-color)">Welcome!</h1>
      {servers.length > 0 ? <ServersList servers={servers} /> : <NoServers />}
    </div>
  </Card>
);
