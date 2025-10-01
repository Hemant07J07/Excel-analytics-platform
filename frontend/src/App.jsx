// src/App.jsx (add dark mode wrapper)
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import UploadDetail from "./pages/UploadDetail";
import { setAuthToken } from "./api";
import Navbar from "./components/Navbar";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "1");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setAuthToken(token);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark ? "1" : "0");
  }, [dark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onLogout={() => {}} dark={dark} setDark={setDark} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><UploadPage/></PrivateRoute>} />
        <Route path="/uploads/:id" element={<PrivateRoute><UploadDetail/></PrivateRoute>} />
      </Routes>
    </div>
  );
}
