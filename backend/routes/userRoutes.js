const express = require('express');
const router = express.Router();
const { createUser, getClasses } = require('../controllers/UserController');



// POST: Login a user
router.post('/login', createUser);
router.post('/getclasses', getClasses);
module.exports = router;
