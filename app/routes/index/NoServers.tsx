import { faPlus, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { ExternalLink } from 'react-external-link';
import { useSession } from '../../auth/session-context';

export const NoServers: FC = () => {
  const session = useSession();
  return (
    <div className="tw:p-6 tw:text-center tw:flex tw:flex-col tw:gap-8">
      <p className="tw:text-xl">
        This application will help you manage your Shlink servers.
      </p>
      {session?.role !== 'managed-user' && (
        <p>
          <Button inline size="lg" to="/manage-servers/create">
            <FontAwesomeIcon icon={faPlus} />
            Add a server
          </Button>
        </p>
      )}
      <p>
        <ExternalLink href="https://shlink.io/documentation">
          Learn more about Shlink <FontAwesomeIcon icon={faUpRightFromSquare} />
        </ExternalLink>
      </p>
    </div>
  );
};
