import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import Dashboard from "./Pages/Dashboard";
import ForgotPassword from "./Pages/ForgotPassword";
import AdminDashboard from "./Pages/AdminDashboard";
import Signup from "./Pages/Signup";
import ResetPassword from "./Pages/ResetPassword";
import EditPost from "./Pages/EditPost";
import CreatePost from "./Pages/CreatePost";
import EventDetails from "./Pages/EventDetails";




const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/eventdetails" element={<EventDetails />} />
        <Route path="/" element={<Login />} />
        <Route path="/editpost" element={<EditPost/>}/>
        <Route path="/createpost" element={<CreatePost/>}/>
    
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/forgotpassword" element={<ForgotPassword/>}/>
        <Route path="*" element={<NotFound />} />
        <Route path="/admindashboard" element={<AdminDashboard/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        

      </Routes>
    </Router>
  );
};

export default App;
