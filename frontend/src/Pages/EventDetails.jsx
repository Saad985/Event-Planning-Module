import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const navigate = useNavigate();

  const eventId = localStorage.getItem("selectedEventId");

  useEffect(() => {
    if (eventId) {
      axios.get(`http://localhost:8081/api/events/${eventId}`)
        .then((response) => {
          setEvent(response.data);
        })
        .catch((error) => {
          console.error("Error fetching event details:", error);
        });

      axios.get("http://localhost:8081/api/events")
        .then((response) => {
          const filteredEvents = response.data.filter((e) => e.id !== parseInt(eventId));
          setRelatedEvents(filteredEvents);
        })
        .catch((error) => {
          console.error("Error fetching related events:", error);
        });
    }
  }, [eventId]);

  if (!event) {
    return <p className="text-center mt-10 text-red-500">Loading event details...</p>;
  }

  const formatDate = (dateStr) => new Date(dateStr).toISOString().split("T")[0];

  return (
    <div className="p-8 flex-1 bg-gray-100 min-h-screen">
      <div className="bg-gray-300 p-4 flex justify-between items-center rounded-md shadow-md">
        <h1 className="text-xl font-bold text-center flex-1">
          Welcome to <span className="text-blue-700">UET Events</span>
        </h1>
      </div>

      <div className="flex mt-6 gap-6">
        <div className="w-1/2 bg-gray-300 h-80 flex items-center justify-center">
          {event.cover_image ? (
            <img src={`http://localhost:8081${event.cover_image}`} alt={event.event_title} className="w-full h-full object-cover rounded-md" />
          ) : (
            <p className="text-gray-500">No Image</p>
          )}
        </div>

        <div className="w-1/2 p-4 bg-white shadow-md rounded">
          <h2 className="text-xl font-bold mb-2">{event.event_title}</h2>
          <p><strong>Time:</strong> {event.event_time}</p>
          <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
          <p><strong>Description:</strong> {event.description}</p>
          <p><strong>Location:</strong> {event.location}</p>

          <button 
            onClick={() => navigate("/dashboard")} 
            className="bg-red-600 text-white px-4 py-2 mt-12 rounded w-full hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <h3 className="mt-8 text-lg font-bold">Related Events</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {relatedEvents.length === 0 ? (
          <p className="text-gray-600">No related events available</p>
        ) : (
          relatedEvents.map((event) => (
            <div key={event.id} className="bg-white p-4 rounded-md shadow-md border border-gray-300 text-center">
              <div className="h-24 bg-gray-300 flex items-center justify-center">
                {event.cover_image ? (
                  <img src={`http://localhost:8081${event.cover_image}`} alt={event.event_title} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <p className="text-gray-500">No Image</p>
                )}
              </div>
              <p className="mt-2 font-semibold">{event.event_title}</p>
              <button 
                onClick={() => {
                  localStorage.setItem("selectedEventId", event.id);
                  window.location.reload();
                }} 
                className="bg-blue-700 text-white px-4 py-2 mt-2 rounded w-full hover:bg-blue-800"
              >
                View Detail
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventDetails;
