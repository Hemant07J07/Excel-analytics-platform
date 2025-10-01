// src/pages/UploadDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export default function UploadDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [upload, setUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState("");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${API_BASE}/uploads/${id}/`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setUpload(res.data);
        // preselect first sheet
        const sheets = Object.keys(res.data.metadata || {});
        if (sheets.length) {
          setSheet(sheets[0]);
        }
      } catch (err) {
        console.error("Failed to load upload:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!upload || !sheet) return;
    const cols = (upload.metadata?.[sheet]?.columns || []);
    setXCol(cols[0] || "");
    setYCol(cols[1] || "");
  }, [upload, sheet]);

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    // For now we just console.log the chosen params.
    // Later we'll POST to /api/analyses/ endpoint (backend to be added).
    console.log("Start analysis:", { upload_id: id, sheet, xCol, yCol, chartType });
    alert("Analysis would start (stub). Next: implement /api/analyses/ backend and chart viewer.");
    // Example: navigate to /analyses/new?upload=... (future)
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!upload) return <div className="p-6">Upload not found.</div>;

  const metadata = upload.metadata || {};
  const sheets = Object.keys(metadata);

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">{upload.original_name}</h1>
          <div className="text-sm text-gray-500">Uploaded: {new Date(upload.uploaded_at).toLocaleString()}</div>
        </div>
        <div>
          <button onClick={() => nav("/dashboard")} className="px-3 py-1 bg-gray-200 rounded">Back</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Detected Sheets & Preview</h3>

          {sheets.length === 0 && <div className="text-sm text-gray-500">No metadata available.</div>}

          {sheets.map((s) => {
            const item = metadata[s];
            const preview = item?.preview || [];
            const cols = item?.columns || (preview[0] ? Object.keys(preview[0]) : []);
            return (
              <div key={s} className="mb-4">
                <h4 className="font-medium">{s}</h4>
                <div className="overflow-auto bg-gray-50 p-2 rounded">
                  <table className="w-full text-sm table-auto border-collapse">
                    <thead>
                      <tr>
                        {cols.map((c) => (
                          <th key={c} className="border px-2 py-1 text-left bg-white">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                          {cols.map((c) => <td key={c} className="border px-2 py-1">{String(row[c] ?? "")}</td>)}
                        </tr>
                      ))}
                      {preview.length === 0 && <tr><td className="p-2">No preview rows</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create Analysis (quick)</h3>

          <form onSubmit={handleStartAnalysis} className="space-y-3">
            <label className="block text-sm">Sheet</label>
            <select value={sheet} onChange={(e) => setSheet(e.target.value)} className="w-full p-2 border rounded">
              {sheets.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="block text-sm">X column</label>
            <select value={xCol} onChange={(e) => setXCol(e.target.value)} className="w-full p-2 border rounded">
              {(upload.metadata?.[sheet]?.columns || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="block text-sm">Y column</label>
            <select value={yCol} onChange={(e) => setYCol(e.target.value)} className="w-full p-2 border rounded">
              {(upload.metadata?.[sheet]?.columns || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="block text-sm">Chart type</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="w-full p-2 border rounded">
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
              <option value="scatter">Scatter</option>
            </select>

            <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded">Start analysis</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
