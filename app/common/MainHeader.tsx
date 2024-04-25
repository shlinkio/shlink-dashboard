import React, { FC } from 'react';
import { Link } from '@remix-run/react';
import { Navbar, NavbarBrand } from 'reactstrap';
import { ShlinkLogo } from './ShlinkLogo';

export const MainHeader: FC = () => {
  return (
    <Navbar color="primary" dark fixed="top" className="main-header" expand="md">
      <NavbarBrand tag={Link} to="/">
        <ShlinkLogo className="main-header__brand-logo" color="white" /> Shlink
      </NavbarBrand>
    </Navbar>
  );
};
