import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EditPost = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    event_title: "",
    event_date: "",
    event_time: "",
    location: "",
    cover_image: null,
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const eventId = localStorage.getItem("editEventId");

  useEffect(() => {
    if (!eventId) {
      navigate("/admindashboard");
      return;
    }

    axios
      .get(`http://localhost:8081/api/events/${eventId}`)
      .then((response) => {
        const data = response.data;
        const formattedDate = data.event_date
          ? data.event_date.split("T")[0]
          : "";
        setEventData({
          ...data,
          event_date: formattedDate,
        });
      })
      .catch((error) => console.error("Error fetching event data:", error));
  }, [eventId, navigate]);

  const handleChange = (e) => {
    if (e.target.name === "cover_image") {
      setEventData((prevData) => ({
        ...prevData,
        cover_image: e.target.files[0],
      }));
    } else {
      setEventData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
  };

  // Helper to add +1 day to the selected date
  const getNextDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleEditPost = () => {
    const adjustedDate = getNextDay(eventData.event_date); // Add +1 day here

    const formData = new FormData();
    formData.append("event_title", eventData.event_title);
    formData.append("event_date", adjustedDate);
    formData.append("event_time", eventData.event_time);
    formData.append("location", eventData.location);
    formData.append("description", eventData.description);
    if (eventData.cover_image && typeof eventData.cover_image !== "string") {
      formData.append("cover_image", eventData.cover_image);
    }

    axios
      .put(`http://localhost:8081/api/events/${eventId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data && res.data.success === false) {
          setErrorMessage(res.data.message);
        } else {
          navigate("/admindashboard");
        }
      })
      .catch((error) => {
        console.error("Error updating event:", error);
        setErrorMessage("Failed to update event. Try again later.");
      });
  };

  const timeOptions = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00"
  ];

  const locationOptions = [
    "Library", "Auditorium", "Cafeteria", "Lab 1", "Lab 2", "Seminar Hall"
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 border-b-2 border-blue-700 pb-2 text-center">
        Welcome to UET Events
      </h1>
      <div className="bg-white p-6 rounded shadow-md w-2/3">
        <h2 className="text-xl font-bold mb-4 text-center">Edit Event Post</h2>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Event Title</label>
            <input
              type="text"
              name="event_title"
              value={eventData.event_title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Event Date</label>
            <input
              type="date"
              name="event_date"
              value={eventData.event_date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Event Time</label>
            <select
              name="event_time"
              value={eventData.event_time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={eventData.event_time}>
                {eventData.event_time || "Select Time"}
              </option>
              {timeOptions
                .filter((time) => time !== eventData.event_time)
                .map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Location</label>
            <select
              name="location"
              value={eventData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={eventData.location}>
                {eventData.location || "Select Location"}
              </option>
              {locationOptions
                .filter((loc) => loc !== eventData.location)
                .map((loc) => (
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
            name="cover_image"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {eventData.cover_image && (
            <img
              src={
                typeof eventData.cover_image === "string"
                  ? `http://localhost:8081${eventData.cover_image}`
                  : URL.createObjectURL(eventData.cover_image)
              }
              alt="Cover Preview"
              className="mt-2 w-full h-40 object-cover rounded"
            />
          )}
        </div>
        <div className="mt-4">
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleChange}
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
            onClick={handleEditPost}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900"
          >
            Edit Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
