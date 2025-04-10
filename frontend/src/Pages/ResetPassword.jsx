import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const { token } = useParams(); // Extracting token from URL params
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState(''); // State to store message color
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8081/reset-password', {
        password,
        confirmPassword,
        token
      });
      setMessage(response.data.message);
      setMessageColor('bg-green-500'); // Set color to green for success
    } catch (error) {
      setMessage(error.response.data.error);
      setMessageColor('bg-red-500'); // Set color to red for error
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 flex items-center">
        <img src="./images/Logo.png" alt="Logo" className="h-12 w-12 mr-2" /> {/* Logo */}
        <div className="text-xl font-bold">Online Resource Sharing System</div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl mb-4">Reset Password</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4 relative">
              <label className="block mb-2">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 cursor-pointer mt-8"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            <div className="mb-4 relative">
              <label className="block mb-2">Confirm New Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 cursor-pointer mt-8"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
              Reset Password
            </button>
          </form>
          {message && <p className={`mt-4 text-center text-white p-2 rounded ${messageColor}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
