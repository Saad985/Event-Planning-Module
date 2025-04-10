import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8081/api/events")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  const handleViewDetails = (eventId) => {
    localStorage.setItem("selectedEventId", eventId);
    navigate("/eventdetails");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
    {/* Header with Back Arrow */}
    <div className="bg-gray-300 p-4 flex items-center gap-4 rounded-md shadow-md">
      <div 
        className="w-10 h-10 bg-white flex items-center justify-center rounded-md shadow cursor-pointer hover:bg-gray-200"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft className="text-black" />
      </div>
      <h1 className="text-xl font-bold text-center flex-1">
        Welcome to <span className="text-blue-700">UET Events</span>
      </h1>
    </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {events.length === 0 ? (
          <p className="text-center text-gray-600">No events available</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-4 rounded-md shadow-md border border-gray-300">
              <div className="w-full h-32 bg-gray-300 flex items-center justify-center">
                {event.cover_image ? (
                  <img src={`http://localhost:8081${event.cover_image}`} alt={event.event_title} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <span className="text-gray-600">No Image</span>
                )}
              </div>
              <h2 className="text-center font-semibold mt-2">{event.event_title}</h2>
              <p className="text-center text-sm text-gray-500">
                {new Date(event.event_date).toISOString().split("T")[0]} at {event.event_time}
              </p>
              <p className="text-center text-sm text-gray-500">Location: {event.location}</p>
              
              <button 
                onClick={() => handleViewDetails(event.id)}
                className="bg-blue-700 text-white w-full py-2 mt-3 rounded-md hover:bg-blue-800">
                View Detail
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
