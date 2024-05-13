import React from 'react';
import CustomSidebar from './pages/sidebar';
import { Outlet } from 'react-router-dom';  // This is where nested routes will be injected

const MainLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <CustomSidebar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;
