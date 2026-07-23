const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { addComment, getTaskComments } = require('../controllers/comment.controller');

router.post('/:taskId', protect, addComment);
router.get('/:taskId', protect, getTaskComments);

module.exports = router;
