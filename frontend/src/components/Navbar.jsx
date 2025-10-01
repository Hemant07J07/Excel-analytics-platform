// src/components/Navbar.jsx
import React from "react";
import { UploadCloud, LogOut, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { setAuthToken } from "../api";
import clsx from "clsx";

export default function Navbar({ onOpenUpload, onLogout, dark, setDark }) {
  const logout = () => {
    setAuthToken(null);
    if (onLogout) onLogout();
  };

  return (
    <header className="w-full bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold">EA</div>
          <div>
            <div className="text-lg font-semibold">Excel Analytics</div>
            <div className="text-xs text-slate-500 dark:text-slate-300">Upload • Analyze • Visualize</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => window.location.href = "/upload"} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
            <UploadCloud size={16} />
            New Upload
          </motion.button>

          <button onClick={() => setDark(!dark)} className="p-2 rounded-md bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
