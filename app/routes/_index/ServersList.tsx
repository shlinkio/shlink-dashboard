import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import type { FC } from 'react';
import type { Server } from '../../entities/Server';

export type ServersListProps = {
  servers: Server[];
};

export const ServersList: FC<ServersListProps> = ({ servers }) => (
  <div className="md:tw-max-h-64 md:tw-min-h-48 tw-overflow-auto">
    {servers.map((server, index) => (
      <Link
        key={`${server.publicId}${index}`}
        to={`/server/${server.publicId}`}
        className={clsx(
          'tw-flex tw-justify-between tw-items-center tw-py-3 tw-px-4',
          'tw-border-b tw-border-b-[var(--border-color)] hover:tw-bg-[var(--secondary-color)]',
        )}
      >
        <span>{server.name}</span>
        <FontAwesomeIcon icon={faChevronRight} />
      </Link>
    ))}
  </div>
);
