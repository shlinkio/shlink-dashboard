import {
  faArrowRightFromBracket as faLogout,
  faChevronDown as arrowIcon,
  faCogs,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from '@remix-run/react';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { useSession } from '../auth/session-context';
import { ShlinkLogo } from './ShlinkLogo';

export const MainHeader: FC = () => {
  const session = useSession();
  const [isOpen, toggleCollapse] = useToggle();
  const { pathname } = useLocation();

  return (
    <Navbar color="primary" dark fixed="top" className="main-header" expand="md">
      <NavbarBrand tag={Link} to="/">
        <ShlinkLogo className="tw-inline-block tw-mr-1 tw-w-[26px]" color="white" /> Shlink
      </NavbarBrand>

      {session !== null && (
        <>
          <NavbarToggler onClick={toggleCollapse}>
            <FontAwesomeIcon icon={arrowIcon} />
          </NavbarToggler>

          <Collapse navbar isOpen={isOpen}>
            <Nav navbar className="tw-ml-auto">
              <NavItem>
                <NavLink tag={Link} to="/settings" active={pathname.startsWith('/settings')}>
                  <FontAwesomeIcon icon={faCogs} className="tw-w-[26px] tw-inline-block" /> Settings
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/logout">
                  <FontAwesomeIcon icon={faLogout} className="tw-w-[26px] tw-inline-block" /> Logout
                  {session.displayName && (
                    <span className="tw-ml-2">({session.displayName})</span>
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
