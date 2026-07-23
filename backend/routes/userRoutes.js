const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getAllUsers);

module.exports = router;
