import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/authContext';
import { useParams } from 'react-router-dom'; // Import useParams

const MyNotes = () => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true); // To handle loading state
  const { currentUser } = useAuth();
  const { groupId } = useParams(); // Use useParams to access groupId

  useEffect(() => {
    if (currentUser) {
      currentUser.getIdToken().then(token => {
        fetch(`http://localhost:4000/notes/getnotes/${groupId}`, {
          method: 'GET', // GET request to fetch data
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to fetch notes');
        })
        .then(data => {
          setNote(data.notes); // Assuming the notes are returned under 'notes' key
          setLoading(false);
        })
        .catch(error => {
          console.error('Fetch error:', error);
          setLoading(false);
        });
      });
    }
  }, [currentUser, groupId]); // Dependency array to refetch when currentUser or groupId changes

  const handleSave = () => {
    if (currentUser) {
      currentUser.getIdToken().then(token => {
        console.log('JWT Token:', token);
        console.log('Note saved:', note);

        fetch(`http://localhost:4000/notes/savenotes/${groupId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ notes: note })
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          console.log('Success:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }).catch(error => {
        console.error('Error getting token:', error);
      });
    } else {
      console.log('No user logged in');
    }
  };

  if (loading) {
    return <div>Loading notes...</div>; // Display loading state
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
      <Typography variant="h3" sx={{ fontFamily: 'Cursive', mb: 4, textAlign: 'center' }}>
        My Notes
      </Typography>
      <TextField
        multiline
        rows={10}
        variant="outlined"
        placeholder="Write your notes here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        startIcon={<SaveIcon />}
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ width: '200px' }}
      >
        Save
      </Button>
    </Box>
  );
}

export default MyNotes;
