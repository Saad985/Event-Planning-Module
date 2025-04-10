import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8081/api/events")
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setError("Failed to load events.");
        setLoading(false);
      });
  }, []);

  const confirmDelete = (event) => {
    setSelectedEvent(event);
    setShowDeletePopup(true);
  };

  const handleDelete = () => {
    if (!selectedEvent) return;

    axios.delete(`http://localhost:8081/api/events/${selectedEvent.id}`)
      .then(() => {
        setEvents(events.filter(event => event.id !== selectedEvent.id));
        setShowDeletePopup(false);
      })
      .catch(error => console.error("Error deleting event:", error));
  };

  const handleEdit = (eventId) => {
    localStorage.setItem("editEventId", eventId);
    navigate("/editpost");
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading events...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

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

      {/* Create Post Button */}
      <div className="flex justify-end my-4">
        <button onClick={() => navigate('/createpost')} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
          Create Post
        </button>
      </div>

      <h2 className="text-lg font-bold mb-4">Previous Posts</h2>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <p className="text-center text-gray-500">No events available</p>
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

              <div className="flex justify-between mt-2">
                <button onClick={() => handleEdit(event.id)} className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800">
                  Edit
                </button>
                <button onClick={() => confirmDelete(event)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete <strong>{selectedEvent.event_title}</strong>?</p>
            <div className="flex justify-between mt-4">
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Delete
              </button>
              <button onClick={() => setShowDeletePopup(false)} className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
