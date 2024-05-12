const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/UserController');
const {createClass }  = require('../controllers/classController');



// POST: Login a user
router.post('/create', createClass);

module.exports = router;
