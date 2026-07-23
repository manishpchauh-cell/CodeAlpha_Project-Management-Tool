import React, { useState } from 'react';
import axios from 'axios';

function AddUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });
      alert('User created successfully');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h3>Add New User</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      /><br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      /><br />
      <button type="submit">Create User</button>
    </form>
  );
}

export default AddUserForm;
