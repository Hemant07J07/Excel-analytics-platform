// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import StatsCard from "../components/StatsCard";
import UploadCard from "../components/UploadCard";

export default function Dashboard() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/uploads/");
        setUploads(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const processed = uploads.filter(u => u.processed).length;
  const pending = uploads.length - processed;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Excel Analytics — Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Upload spreadsheets, analyze data & create charts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Total Uploads" value={loading ? "..." : uploads.length} />
        <StatsCard title="Processed" value={loading ? "..." : processed} />
        <StatsCard title="Pending" value={loading ? "..." : pending} />
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent uploads</h2>
          <button onClick={() => window.location.href = "/upload"} className="text-sm text-indigo-600 hover:underline">Upload new</button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {loading && <div className="text-sm text-slate-500">Loading...</div>}
          {!loading && uploads.length === 0 && <div className="text-sm text-slate-500">No uploads yet</div>}
          {!loading && uploads.map(u => <UploadCard key={u.id} u={u} onOpen={() => window.location.href = `/uploads/${u.id}`} />)}
        </div>
      </section>
    </div>
  );
}
