const express = require('express');
const router = express.Router();
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  getProjectStats
} = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, getUserProjects);

router.route('/:id')
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.get('/:id', protect, getProjectById);
router.put('/:id/add-member', protect, addProjectMember);
const { removeProjectMember } = require('../controllers/project.controller');
router.put('/:id/remove-member', protect, removeProjectMember);

router.get('/:id/stats', protect, getProjectStats);

module.exports = router;

