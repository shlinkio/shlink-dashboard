import {
  faArrowRightFromBracket as faLogout,
  faCogs,
  faServer,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, NavBar } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { Link, useLocation } from 'react-router';
import { useSession } from '../auth/session-context';
import { ShlinkLogo } from './ShlinkLogo';

const NavBarMenuItems: FC = () => {
  const session = useSession();
  const { pathname } = useLocation();

  if (!session) {
    return null;
  }

  return (
    <>
      {session.role === 'admin' && (
        <NavBar.MenuItem
          to="/manage-users/1"
          active={pathname.startsWith('/manage-users')}
          className="tw:flex tw:items-center tw:gap-1.5"
        >
          <FontAwesomeIcon icon={faUsers} />
          <span className="tw:whitespace-nowrap">Manage users</span>
        </NavBar.MenuItem>
      )}
      <NavBar.Dropdown
        buttonContent={(
          <span className="tw:flex tw:items-center tw:gap-1.5" data-testid="user-menu">
            <FontAwesomeIcon icon={faUser} fixedWidth /> {session.displayName || session.username}
          </span>
        )}
      >
        <Dropdown.Item to="/profile" selected={pathname === '/profile'}>
          <FontAwesomeIcon icon={faUser} fixedWidth className="tw:mr-0.5" /> My profile
        </Dropdown.Item>
        <Dropdown.Item to="/settings" selected={pathname.startsWith('/settings')}>
          <FontAwesomeIcon icon={faCogs} fixedWidth className="tw:mr-0.5" /> My settings
        </Dropdown.Item>
        {session.role !== 'managed-user' && (
          <>
            <Dropdown.Separator />
            <Dropdown.Item to="/manage-servers/1" selected={pathname.startsWith('/manage-servers')}>
              <FontAwesomeIcon icon={faServer} fixedWidth className="tw:mr-0.5" /> Manage servers
            </Dropdown.Item>
          </>
        )}
        <Dropdown.Separator />
        <Dropdown.Item to="/logout">
          <FontAwesomeIcon icon={faLogout} fixedWidth className="tw:mr-0.5" /> Logout
        </Dropdown.Item>
      </NavBar.Dropdown>
    </>
  );
};

export const MainHeader: FC = () => {
  return (
    <NavBar
      className="tw:[&]:fixed tw:top-0 tw:z-900"
      brand={(
        <Link to="" className="tw:[&]:text-white tw:no-underline tw:flex tw:gap-2 tw:w-25">
          <ShlinkLogo className="tw:w-[26px]" color="white" /> Shlink
        </Link>
      )}
    >
      <NavBarMenuItems />
    </NavBar>
  );
};
