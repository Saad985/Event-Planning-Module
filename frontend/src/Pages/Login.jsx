import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login request to the backend
      const response = await axios.post('http://localhost:8081/', { email, password });
      const { token, user } = response.data;

      // Store token and user data in localStorage for authentication
      localStorage.setItem('token', token);
      localStorage.setItem('email', JSON.stringify(user?.email));
      localStorage.setItem('userRole', user.role); // Store user role

      // Check the role returned from the server
      if (user.role === 'admin') {
        navigate('/admindashboard');
      } else if (user.role === 'user') {
        navigate('/dashboard');
      } else {
        setError('Invalid role. Please contact support.');
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        setError(error.response.data.error);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an error
        console.error('Error:', error.message);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 flex items-center">
        <img src="./images/Logo.png" alt="Logo" className="h-12 w-12 mr-2" /> {/* Logo */}
        <div className="text-xl font-bold">Event Management System</div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl mb-4">Login</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <p>
              <Link to="/forgotpassword" className="text-blue-500 hover:underline">
                Forgot Password?
              </Link>
            </p>
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-2">
              Login
            </button>
          </form>
          <div className="mt-4 flex justify-between items-center">
            <p>
              Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Signup</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
