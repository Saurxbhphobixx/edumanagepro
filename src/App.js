// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import HomePage from "./component/HomePage";
import Login from "./component/LoginPage";
import ForgotPassword from "./component/ForgotPassword";
import Dashboard from "./component/admin/JS/Dashboard";
import TeacherDashboard from "./component/staff/JS/TeacherDashboard";
import StudDashboard from "./component/student/JS/StudDashboard";
import OPDashboard from "./component/operation/JS/OPDashboard";

const ProtectedRoute = () => {
  const role = localStorage.getItem("userRole");
  console.log("User role retrieved:", role);

  if (role === "admin") {
    return <Dashboard />;
  } else if (role === "staff") {
    return <TeacherDashboard />;
  } else if (role === "student") {
    return <StudDashboard />;
  } else if (role === "operation") {
    return <OPDashboard />;
  } else {
    console.error("Invalid role or not logged in, redirecting to login");
    return <Navigate to="/login" />;
  }
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId="275543100765-to2bmovcui3m74fp709l7qaq3986ra86.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;