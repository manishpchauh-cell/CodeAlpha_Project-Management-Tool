const Task = require('../models/Task');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Express route for file upload (to be used in routes/taskRoutes.js)
exports.uploadAttachment = [
  upload.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ filename: req.file.originalname, url: fileUrl });
  }
];

// Create Task
exports.createTask = async (req, res) => {
  const { title, description, status, projectId, assignedTo, dueDate, priority, attachments } = req.body;
  try {
    const task = await Task.create({
      title,
      description,
      status,
      project: projectId,
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
      attachments: attachments || [],
    });
    // Emit event
    req.app.get('io').to(projectId).emit('taskCreated', task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all tasks for a project (also populate assigned user)
exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
                            .populate('assignedTo', 'name email'); // ✅ Populate user
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update task (handle assignedTo update too)
exports.updateTask = async (req, res) => {
  const { title, description, status, assignedTo, dueDate, priority, attachments } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.priority = priority !== undefined ? priority : task.priority;
    task.attachments = attachments !== undefined ? attachments : task.attachments;

    await task.save();
    // Emit event
    req.app.get('io').to(task.project.toString()).emit('taskUpdated', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const projectId = task.project.toString();
    await task.deleteOne();
    // Emit event
    req.app.get('io').to(projectId).emit('taskDeleted', req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
