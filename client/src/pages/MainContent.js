// components/MainContent.js

import React from 'react';
import { Box, Typography } from '@mui/material';

const MainContent = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'black', p: 3, color: 'white' }}>
      {children ? children : (
        <Typography variant="h4">
          Welcome to the Dashboard
        </Typography>
      )}
    </Box>
  );
};

export default MainContent;
