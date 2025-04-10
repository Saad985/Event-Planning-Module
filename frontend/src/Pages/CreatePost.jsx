import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreatePost = () => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const timeOptions = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00"
  ];

  const locationOptions = [
    "Library", "Auditorium", "Cafeteria", "Lab 1", "Lab 2", "Seminar Hall"
  ];

  // Helper function to add 1 day to eventDate
  const getNextDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleCreatePost = async () => {
    // Validation
    if (!eventTitle || !eventDate || !eventTime || !location || !description || !coverImage) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const adjustedDate = getNextDay(eventDate); // Add +1 day

    const formData = new FormData();
    formData.append("event_title", eventTitle);
    formData.append("event_date", adjustedDate); // Store adjusted date
    formData.append("event_time", eventTime);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("cover_image", coverImage);

    try {
      const response = await axios.post("http://localhost:8081/api/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setErrorMessage("");
      navigate("/admindashboard");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Something went wrong while creating the event.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 border-b-2 border-blue-700 pb-2 text-center">
        Welcome to UET Events
      </h1>
      <div className="bg-white p-6 rounded shadow-md w-2/3">
        <h2 className="text-xl font-bold mb-4 text-center">Create Event Post</h2>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Event Title</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Event Starting Time</label>
            <select
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Location</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-semibold mb-1">Cover Image</label>
          <input
            type="file"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mt-4">
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded h-24"
          ></textarea>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate("/admindashboard")}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePost}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900"
          >
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
