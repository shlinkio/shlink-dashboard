import { faPlus, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { ExternalLink } from 'react-external-link';
import { Link } from 'react-router';
import { Button } from 'reactstrap';

export const NoServers: FC = () => (
  <div className="tw:p-6 tw:text-center tw:flex tw:flex-col tw:gap-8">
    <p className="tw:text-xl">
      This application will help you manage your Shlink servers.
    </p>
    <p>
      <Button color="primary" outline size="lg" tag={Link} to="/servers/create">
        <FontAwesomeIcon icon={faPlus} className="tw:mr-2"/>
        Add a server
      </Button>
    </p>
    <p>
      <ExternalLink href="https://shlink.io/documentation">
        Learn more about Shlink <FontAwesomeIcon icon={faUpRightFromSquare}/>
      </ExternalLink>
    </p>
  </div>
);
