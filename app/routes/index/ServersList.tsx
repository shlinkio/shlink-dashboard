import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import type { FC } from 'react';
import { Link } from 'react-router';
import type { PlainServer } from '../../entities/Server';

export type ServersListProps = {
  servers: PlainServer[];
};

export const ServersList: FC<ServersListProps> = ({ servers }) => (
  <div className="tw:md:max-h-64 tw:md:min-h-48 tw:overflow-auto" data-testid="servers-list">
    {servers.map((server, index) => (
      <Link
        key={`${server.publicId}${index}`}
        to={`/server/${server.publicId}`}
        className={clsx(
          'tw:flex tw:justify-between tw:items-center tw:py-3 tw:px-4',
          'tw:border-b tw:border-b-lm-border tw:dark:border-b-dm-border',
          'tw:highlight:bg-lm-secondary tw:highlight:dark:bg-dm-secondary',
        )}
      >
        <span>{server.name}</span>
        <FontAwesomeIcon icon={faChevronRight} />
      </Link>
    ))}
  </div>
);
