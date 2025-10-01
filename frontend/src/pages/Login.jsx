import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/token/", form);
      const token = res.data.access;
      setAuthToken(token);
      nav("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl mb-4">Log in</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <input className="mb-2 w-full p-2 border rounded" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
        <input type="password" className="mb-4 w-full p-2 border rounded" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <button className="w-full bg-indigo-600 text-white p-2 rounded">Log in</button>
      </form>
    </div>
  );
}
