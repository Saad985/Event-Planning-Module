import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgetPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8081/forgot-password', { email });
      setMessage(response.data.message);
      setMessageColor('bg-green-500'); // Set color to green for success
    } catch (error) {
      setMessage(error.response.data.error);
      setMessageColor('bg-red-500'); // Set color to red for error
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
          <h2 className="text-2xl mb-4">Forgot Password</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
              Reset Password
            </button>
          </form>
          {message && (
            <div className={`mt-4 p-2 rounded text-center text-white ${messageColor}`}>
              {message}
            </div>
          )}
          <div className="mt-4 text-center">
            <p>
              Remembered your password? <Link to="/" className="text-blue-500 hover:underline">Go to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordForm;
