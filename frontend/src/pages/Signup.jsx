import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post("http://127.0.0.1:8000/api/auth/register/", form);
      nav("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handle} className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl mb-4">Sign up</h2>
        {error && <div className="text-red-600 mb-2">{JSON.stringify(error)}</div>}
        <input className="mb-2 w-full p-2 border rounded" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
        <input className="mb-2 w-full p-2 border rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input type="password" className="mb-4 w-full p-2 border rounded" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <button className="w-full bg-indigo-600 text-white p-2 rounded">Create account</button>
      </form>
    </div>
  );
}
