import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { red } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MainContent from './MainContent';
import AddClassDialog from '../components/addClass';
import SchoolIcon from '@mui/icons-material/School';

export default function PermanentDrawer() {
  const drawerWidth = 240;
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleClickListItem = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchClasses = async () => {
    if (currentUser?.email) {
      try {
        const response = await fetch('/user/getclasses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: currentUser.email })
        });
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          throw new Error('Failed to fetch classes');
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [currentUser]);

  const handleDialogClose = (shouldRefetch) => {
    setDialogOpen(false);
    if (shouldRefetch) {
      fetchClasses();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <Typography variant="h6" noWrap component="div">
              Classes
            </Typography>
            <IconButton aria-label="add new class" size="small" onClick={() => setDialogOpen(true)}>
              <AddIcon />
            </IconButton>
          </Stack>
          <Divider />
          <List>
            {classes.map((classInfo, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton onClick={(event) => handleClickListItem(event, index)}>
                    <ListItemIcon>
                      <SchoolIcon />
                    </ListItemIcon>
                    <ListItemText primary={classInfo.name} />
                  </ListItemButton>
                </ListItem>
                <Menu
                  anchorEl={anchorEl}
                  open={selectedIndex === index && Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => handleNavigate(`/my-notes/${classInfo.id}`)}>My Notes</MenuItem>
                  <MenuItem onClick={() => handleNavigate(`/compiled-notes/${classInfo.id}`)}>Compiled Notes</MenuItem>
                </Menu>
              </React.Fragment>
            ))}
          </List>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon sx={{ color: red[500] }} />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: red[500] }} />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>
      <AddClassDialog open={dialogOpen} handleClose={handleDialogClose} />
    </Box>
  );
}
