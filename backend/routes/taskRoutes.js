const express = require('express');
const router = express.Router();
const {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  uploadAttachment,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createTask);
router.get('/:projectId', protect, getProjectTasks);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.post('/upload', protect, uploadAttachment);

module.exports = router;
