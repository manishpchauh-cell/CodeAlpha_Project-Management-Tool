import './Dashboard.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
      // Fetch stats for each project
      res.data.forEach(async (project) => {
        const statsRes = await axios.get(`http://localhost:5000/api/projects/${project._id}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjectStats(prev => ({ ...prev, [project._id]: statsRes.data }));
      });
    } catch (err) {
      alert('Failed to fetch projects');
    }
  };

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/projects',
        {
          title,
          description,
          members: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const updateProject = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${id}`,
        { title: editTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditId(null);
      setEditTitle('');
      fetchProjects();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      <form className="project-form" onSubmit={createProject}>
        <input
          type="text"
          placeholder="New project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button type="submit">Create Project</button>
      </form>
      <div className="project-list">
        {projects.map((project) => {
          const stats = projectStats[project._id] || { total: 0, completed: 0, inProgress: 0 };
          const percent = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
          return (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <Link to={`/project/${project._id}`} className="project-card-title">
                  {project.title}
                </Link>
                <div className="project-card-actions">
                  {editId !== project._id && (
                    <button
                      className="edit-button"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditId(project._id);
                        setEditTitle(project.title);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="delete-button"
                    onClick={() => deleteProject(project._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {editId === project._id ? (
                <div className="project-card-edit">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <button className="edit-button" onClick={() => updateProject(project._id)}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className="project-card-desc">{project.description}</div>
                  <div className="project-card-members">
                    {project.members && project.members.map(m => (
                      <span className="project-member-avatar" key={m._id} title={m.name}>
                        {m.name ? m.name[0].toUpperCase() : '?'}
                      </span>
                    ))}
                  </div>
                  <div className="project-card-stats">
                    <span>Total: {stats.total}</span>
                    <span>In Progress: {stats.inProgress}</span>
                    <span>Done: {stats.completed}</span>
                  </div>
                  <div className="project-card-progress-bar">
                    <div className="project-card-progress" style={{ width: percent + '%' }} />
                  </div>
                  <div className="project-card-progress-label">{percent}% Complete</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Dashboard;