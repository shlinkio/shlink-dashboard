import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { Link } from 'react-router';
import type { PlainServer } from '../../entities/Server';

export type ServersListProps = {
  servers: PlainServer[];
};

export const ServersList: FC<ServersListProps> = ({ servers }) => (
  <div className="md:max-h-64 md:min-h-48 overflow-auto" data-testid="servers-list">
    {servers.map((server, index) => (
      <Link
        key={`${server.publicId}${index}`}
        to={`/server/${server.publicId}`}
        className={clsx(
          'flex justify-between items-center py-3 px-4',
          'border-b border-b-lm-border dark:border-b-dm-border',
          'highlight:bg-lm-secondary highlight:dark:bg-dm-secondary',
        )}
      >
        <span>{server.name}</span>
        <FontAwesomeIcon icon={faChevronRight} />
      </Link>
    ))}
  </div>
);
