import {
  faArrowRightFromBracket as faLogout,
  faChevronDown as arrowIcon,
  faCogs,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Link, useLocation } from 'react-router';
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { useSession } from '../auth/session-context';
import { ShlinkLogo } from './ShlinkLogo';

export const MainHeader: FC = () => {
  const session = useSession();
  const [isOpen, toggleCollapse] = useToggle();
  const { pathname } = useLocation();

  return (
    <Navbar color="primary" dark fixed="top" className="main-header" expand="md">
      <NavbarBrand tag={Link} to="/" className="tw:flex tw:gap-2">
        <ShlinkLogo className="tw:w-[26px]" color="white" /> Shlink
      </NavbarBrand>

      {session !== null && (
        <>
          <NavbarToggler onClick={toggleCollapse}>
            <FontAwesomeIcon icon={arrowIcon} />
          </NavbarToggler>

          <Collapse navbar isOpen={isOpen}>
            <Nav navbar className="tw:ml-auto">
              <NavItem>
                <NavLink tag={Link} to="/settings" active={pathname.startsWith('/settings')}>
                  <FontAwesomeIcon icon={faCogs} className="tw:mr-0.5" /> Settings
                </NavLink>
              </NavItem>
              {session.role === 'admin' && (
                <NavItem>
                  <NavLink tag={Link} to="/users/manage" active={pathname.startsWith('/users/manage')}>
                    <FontAwesomeIcon icon={faUsers} className="tw:mr-0.5" /> Manage users
                  </NavLink>
                </NavItem>
              )}
              <NavItem>
                <NavLink tag={Link} to="/logout">
                  <FontAwesomeIcon icon={faLogout} className="tw:mr-0.5" /> Logout
                  {session.displayName && (
                    <span className="tw:ml-2" data-testid="display-name">({session.displayName})</span>
                  )}
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </>
      )}
    </Navbar>
  );
};
