import './ProjectPage.css';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaTrash, FaEdit, FaCommentDots } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper for sortable task card
function SortableTaskCard({ task, column, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`task-card ${column.replace(/\s/g, '').toLowerCase()}`}>
      <span className="status-bar" />
      {children}
    </div>
  );
}

function ProjectPage() {
  const { projectId } = useParams();
  const token = localStorage.getItem('token');

  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [editTaskId, setEditTaskId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [showCommentFor, setShowCommentFor] = useState(null);

  const [newMemberEmail, setNewMemberEmail] = useState('');

  const [attachments, setAttachments] = useState([]);
  const [editAttachments, setEditAttachments] = useState([]);
  const fileInputRef = useRef();
  const editFileInputRef = useRef();

  const fetchProject = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectTitle(res.data.title);
      setProjectDescription(res.data.description || '');
      setMembers(res.data.members || []);
    } catch (err) {
      console.error('Failed to fetch project', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(prev => ({ ...prev, [taskId]: res.data }));
      setShowCommentFor(taskId);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  // Helper to upload a file and return { filename, url }
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post('http://localhost:5000/api/tasks/upload', formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    let uploadedAttachments = [];
    if (attachments.length > 0) {
      uploadedAttachments = await Promise.all(
        attachments.map(file => uploadFile(file))
      );
    }
    try {
      await axios.post(`http://localhost:5000/api/tasks`, {
        title,
        description,
        status,
        projectId,
        assignedTo,
        dueDate: dueDate || null,
        priority: priority || 'Medium',
        attachments: uploadedAttachments,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setAssignedTo('');
      setDueDate('');
      setPriority('Medium');
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleUpdateTask = async (id) => {
    let uploadedAttachments = editAttachments;
    if (editFileInputRef.current && editFileInputRef.current.files.length > 0) {
      const files = Array.from(editFileInputRef.current.files);
      const uploaded = await Promise.all(files.map(file => uploadFile(file)));
      uploadedAttachments = [...editAttachments, ...uploaded];
    }
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, {
        ...editValues,
        attachments: uploadedAttachments,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditTaskId(null);
      setEditAttachments([]);
      fetchTasks();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleCommentSubmit = async (e, taskId) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/comments/${taskId}`, {
        text: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentText('');
      fetchComments(taskId);
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return;

    try {
      await axios.put(`http://localhost:5000/api/projects/${projectId}/remove-member`, {
        memberId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/projects/${projectId}/add-member`, {
        email: newMemberEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMemberEmail('');
      await fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleEdit = (task) => {
    setEditTaskId(task._id);
    setEditValues({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 'Medium',
    });
    setEditAttachments(task.attachments || []);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  // Group tasks by status
  const columns = ['To Do', 'In Progress', 'Done'];
  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col);
    return acc;
  }, {});

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeTask = tasks.find((t) => t._id === active.id);
    // Find which column the task was dropped into
    let newStatus = null;
    for (const col of columns) {
      if (over.id === col) newStatus = col;
    }
    if (newStatus && activeTask.status !== newStatus) {
      // Update status in backend
      await axios.put(`http://localhost:5000/api/tasks/${active.id}`, { ...activeTask, status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistically update UI
      setTasks((prev) => prev.map(t => t._id === active.id ? { ...t, status: newStatus } : t));
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
    // Socket.IO setup
    const socket = io('http://localhost:5000');
    socket.emit('join', projectId);
    socket.on('taskCreated', (task) => {
      if (task.project === projectId) {
        setTasks((prev) => [...prev, task]);
        toast.success('A new task was created!');
      }
    });
    socket.on('taskUpdated', (task) => {
      if (task.project === projectId) {
        setTasks((prev) => prev.map(t => t._id === task._id ? task : t));
        toast.info('A task was updated.');
      }
    });
    socket.on('taskDeleted', (taskId) => {
      setTasks((prev) => prev.filter(t => t._id !== taskId));
      toast.warn('A task was deleted.');
    });
    socket.on('commentAdded', ({ taskId, comment }) => {
      setComments(prev => ({
        ...prev,
        [taskId]: [comment, ...(prev[taskId] || [])]
      }));
      toast('New comment added!');
    });
    socket.on('memberAdded', ({ member }) => {
      setMembers((prev) => [...prev, member]);
      toast.success(`${member.name} was added to the project!`);
    });
    socket.on('memberRemoved', ({ memberId }) => {
      setMembers((prev) => prev.filter(m => m._id !== memberId));
      toast.warn('A member was removed from the project.');
    });
    return () => socket.disconnect();
  }, [projectId]);

  return (
    <div className="project-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="project-header-card">
        <h2>Project: {projectTitle || 'Loading...'}</h2>
        {projectDescription && <p className="project-description">{projectDescription}</p>}
      </div>
      <div className="member-section">
        <h3>Project Members</h3>
        <div className="member-list">
          {members.map((m) => (
            <div className="member-chip" key={m._id}>
              <span className="member-avatar">{m.name ? m.name[0].toUpperCase() : '?'}</span>
              <span className="member-info">{m.name} <span className="member-email">({m.email})</span></span>
              <button className="remove-btn" onClick={() => handleRemoveMember(m._id)}>Remove</button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddMember} className="add-member-form">
          <input
            type="email"
            placeholder="Add member by email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            required
          />
          <button type="submit">Add Member</button>
        </form>
      </div>

      <div className="create-task-form">
        <h3>Create New Task</h3>
        <form onSubmit={handleCreateTask}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Unassigned</option>
            {members.map(member => (
              <option key={member._id} value={member._id}>{member.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="task-date-input"
          />
          <select value={priority} onChange={e => setPriority(e.target.value)} className="task-priority-select">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={e => setAttachments(Array.from(e.target.files))}
            className="task-file-input"
          />
          <button type="submit">Add Task</button>
        </form>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="task-board">
          {columns.map((column) => (
            <SortableContext key={column} id={column} items={tasksByStatus[column].map(t => t._id)} strategy={verticalListSortingStrategy}>
              <div className="task-column" id={column}>
                <h3>{column}</h3>
                {tasksByStatus[column].map((task) =>
                  editTaskId === task._id ? (
                    <SortableTaskCard key={task._id} task={task} column={column}>
                      <span className="status-bar" />
                      <input
                        value={editValues.title}
                        onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                      />
                      <textarea
                        value={editValues.description}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      />
                      <select
                        value={editValues.status}
                        onChange={(e) => setEditValues({ ...editValues, status: e.target.value })}
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                      <input
                        type="date"
                        value={editValues.dueDate}
                        onChange={e => setEditValues({ ...editValues, dueDate: e.target.value })}
                        className="task-date-input"
                      />
                      <select value={editValues.priority} onChange={e => setEditValues({ ...editValues, priority: e.target.value })} className="task-priority-select">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <input
                        type="file"
                        multiple
                        ref={editFileInputRef}
                        className="task-file-input"
                      />
                      <button onClick={() => handleUpdateTask(task._id)}>Save</button>
                      <button onClick={() => setEditTaskId(null)}>Cancel</button>
                    </SortableTaskCard>
                  ) : (
                    <SortableTaskCard key={task._id} task={task} column={column}>
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <p><strong>Assigned:</strong> {task.assignedTo?.name || 'Unassigned'}</p>
                      {task.dueDate && (
                        <p className="task-due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                      <span className={`priority-badge ${task.priority?.toLowerCase()}`}>{task.priority}</span>
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="task-attachments">
                          {task.attachments.map(att => (
                            <a key={att.url} href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-link">{att.filename}</a>
                          ))}
                        </div>
                      )}
                      <div className="task-actions">
                        <button onClick={() => handleEdit(task)}><FaEdit /></button>
                        <button onClick={() => handleDeleteTask(task._id)}><FaTrash /></button>
                        <button onClick={() => fetchComments(task._id)}><FaCommentDots /></button>
                      </div>
                      {showCommentFor === task._id && (
                        <div className="comments-section">
                          <form onSubmit={(e) => handleCommentSubmit(e, task._id)}>
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment..."
                            />
                            <button type="submit">Post</button>
                          </form>
                          <ul>
                            {(comments[task._id] || []).map(comment => (
                              <li key={comment._id}><strong>{comment.author?.name}:</strong> {comment.text}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </SortableTaskCard>
                  )
                )}
              </div>
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default ProjectPage;
