// In your AddClassDialog component file
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useAuth } from '../context/authContext';

const AddClassDialog = ({ open, handleClose }) => {
  const { currentUser } = useAuth();
  const [className, setClassName] = useState("");
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleAddEmail = () => {
    if (email && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmail("");
    }
  };

  const handleDeleteEmail = (emailToDelete) => () => {
    setEmails(emails.filter((email) => email !== emailToDelete));
  };

  const resetFields = () => {
    setClassName("");
    setEmail("");
    setEmails([]);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleAddClass = async () => {
    if (!className.trim() || emails.length === 0) {
      setError("Class name and at least one email are required.");
      setOpenSnackbar(true);
      return;
    }

    const allEmails = [...emails, currentUser?.email].filter((e, i, a) => a.indexOf(e) === i);

    const classData = {
      classname: className,
      emails: allEmails
    };

    try {
      const response = await fetch('/classes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
      });

      if (response.ok) {
        console.log('Class created successfully:', response);
        resetFields();
        handleClose(true); // Pass true to indicate that refetching is needed
      } else {
        const error = await response.json();
        setError(error.message);
        setOpenSnackbar(true);
      }
    } catch (error) {
      setError('Error sending data');
      setOpenSnackbar(true);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => { resetFields(); handleClose(false); }}
      sx={{ '& .MuiDialog-paper': { minWidth: '40vw', maxWidth: '80vw', width: 'auto' } }}
    >
      <DialogTitle>Add New Class/Create Group</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            label="Class Name"
            variant="outlined"
            fullWidth
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <TextField
            label="Add User by Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
          />
          <Stack direction="row" spacing={1}>
            {emails.map((email, index) => (
              <Chip
                key={index}
                label={email}
                onDelete={handleDeleteEmail(email)}
                variant="outlined"
              />
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { resetFields(); handleClose(false); }}>Cancel</Button>
        <Button onClick={handleAddClass}>Add</Button>
      </DialogActions>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default AddClassDialog;
