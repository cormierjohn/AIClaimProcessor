// Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Adjust the import path as necessary

const Layout = () => (
  <>
    <Header />
    <Outlet />
  </>
);

export default Layout;
