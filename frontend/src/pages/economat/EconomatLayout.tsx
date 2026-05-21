import React from 'react';
import { Outlet } from 'react-router-dom';

const EconomatLayout: React.FC = () => {
  return (
    <div className="container-fluid p-4">
      <Outlet />
    </div>
  );
};

export default EconomatLayout;

// Made with Bob
