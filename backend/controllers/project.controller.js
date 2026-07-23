const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

exports.createProject = async (req, res) => {
  const { title, description, members = [] } = req.body;  // ✅ default to array
  try {
    const project = await Project.create({
      title,
      description,
      members: [...members, req.user.id],
      createdBy: req.user.id,
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user.id }, { members: req.user.id }]
    }).populate('members', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  const { title, description } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email'); // ✅ Must populate name/email

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json(project); // ✅ This should include members
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addProjectMember = async (req, res) => {
  const projectId = req.params.id;
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(user._id);
    await project.save();

    // Return populated project
    const updatedProject = await Project.findById(projectId).populate('members', 'name email');

    // Emit event
    req.app.get('io').to(projectId).emit('memberAdded', { projectId, member: user });

    res.status(200).json({ message: 'Member added', project: updatedProject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeProjectMember = async (req, res) => {
  const { id: projectId } = req.params;
  const { memberId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project.createdBy || project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.members = project.members.filter(m => m.toString() !== memberId);
    await project.save();

    // Emit event
    req.app.get('io').to(projectId).emit('memberRemoved', { projectId, memberId });

    res.json({ message: 'Member removed', project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjectStats = async (req, res) => {
  try {
    const projectId = req.params.id;
    const total = await Task.countDocuments({ project: projectId });
    const completed = await Task.countDocuments({ project: projectId, status: 'Done' });
    const inProgress = await Task.countDocuments({ project: projectId, status: 'In Progress' });
    res.json({ total, completed, inProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
