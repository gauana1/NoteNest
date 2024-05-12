const express = require('express');
const router = express.Router();
const { saveNotes, getNotes } = require('../controllers/notesController');



// POST: Login a user
router.post('/savenotes/:groupId', saveNotes);
router.get('/getnotes/:groupId', getNotes);
module.exports = router;
