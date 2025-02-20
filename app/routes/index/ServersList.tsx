import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import type { FC } from 'react';
import { Link } from 'react-router';
import type { Server } from '../../entities/Server';

export type ServersListProps = {
  servers: Server[];
};

export const ServersList: FC<ServersListProps> = ({ servers }) => (
  <div className="tw:md:max-h-64 tw:md:min-h-48 tw:overflow-auto" data-testid="servers-list">
    {servers.map((server, index) => (
      <Link
        key={`${server.publicId}${index}`}
        to={`/server/${server.publicId}`}
        className={clsx(
          'tw:flex tw:justify-between tw:items-center tw:py-3 tw:px-4',
          'tw:border-b tw:border-b-(--border-color) tw:hover:bg-(--secondary-color)',
        )}
      >
        <span>{server.name}</span>
        <FontAwesomeIcon icon={faChevronRight} />
      </Link>
    ))}
  </div>
);
