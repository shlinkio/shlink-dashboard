import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import clsx from 'clsx';
import type { FC } from 'react';
import { ShlinkLogo } from '../../common/ShlinkLogo';
import type { Server } from '../../entities/Server';
import { NoServers } from './NoServers';
import { ServersList } from './ServersList';

export type WelcomeCardProps = {
  servers: Server[];
};

export const WelcomeCard: FC<WelcomeCardProps> = ({ servers }) => (
  <SimpleCard bodyClassName="!tw-p-0 tw-overflow-hidden tw-rounded-[inherit] tw-flex tw-justify-stretch">
    <div className={clsx(
      'tw-w-4/12 tw-hidden md:tw-flex tw-items-center p-3',
      'tw-border-r tw-border-r-[var(--border-color)]'
    )}>
      <ShlinkLogo />
    </div>
    <div className="md:tw-w-8/12 tw-w-full">
      <h1 className="tw-px-5 tw-py-6 tw-text-center tw-border-b tw-border-b-[var(--border-color)]">Welcome!</h1>
      {servers.length > 0 ? <ServersList servers={servers} /> : <NoServers />}
    </div>
  </SimpleCard>
);
