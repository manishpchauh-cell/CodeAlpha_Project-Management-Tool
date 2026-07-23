# Project Management Tool

A full-stack web application for managing projects, tasks, and team collaboration. Built with React.js frontend and Node.js backend with MongoDB database.

##  Features

- **User Authentication**: Secure login/register system with password reset functionality
- **Project Management**: Create, edit, and manage multiple projects
- **Task Management**: Add tasks to projects with status tracking
- **User Management**: Add team members and assign roles
- **Comment System**: Collaborate with team members through comments
- **Dashboard**: Overview of projects, tasks, and team activities
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- React.js
- CSS3
- HTML5

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

##  Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

##  Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Projects**: Start by creating a new project
3. **Add Tasks**: Break down your project into manageable tasks
4. **Invite Team**: Add team members to collaborate
5. **Track Progress**: Monitor project and task status
6. **Communicate**: Use comments to discuss and collaborate

##  Project Structure

```
project-management-tool/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   └── server.js       # Main server file
├── frontend/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── services/   # API services
│   └── package.json
└── README.md
```

##  API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/users` - Get all users


## 👨‍💻 Author

**Rameen Saleem Khan**
- GitHub: [@Rameen-Saleem](https://github.com/Rameen-Saleem)

