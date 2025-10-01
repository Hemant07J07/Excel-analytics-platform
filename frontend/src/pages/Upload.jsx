// frontend/src/pages/Upload.jsx
import React, { useState, useRef } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [metadata, setMetadata] = useState(null);
  const fileInputRef = useRef();
  const nav = useNavigate();

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Choose a file first.");
      return;
    }
    setStatus("uploading");
    setProgress(0);

    // debug: print api base and auth header
    console.log("API baseURL:", api.defaults.baseURL);
    console.log("API auth header:", api.defaults.headers.common?.Authorization || "(none)");

    const form = new FormData();
    form.append("file", file);

    try {
      // Do NOT set Content-Type manually — axios will set boundary for multipart/form-data
      const res = await api.post("/uploads/", form, {
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      });

      console.log("Upload response:", res.status, res.data);

      const id = res.data?.id;
      if (!id) {
        setStatus("error");
        console.error("No id returned. Response:", res.data);
        alert("Server did not return an id. Check server console.");
        return;
      }

      setStatus("uploaded");
      pollStatus(id);
    } catch (err) {
      console.error("Upload failed (detailed):", err);
      setStatus("error");

      const data = err?.response?.data;
      if (typeof data === "string" && data.trim().startsWith("<!DOCTYPE html")) {
        alert("Upload failed: server returned HTML (likely 404). Check backend URL/routes and server logs.");
      } else {
        alert("Upload failed: " + JSON.stringify(data || err.message));
      }
    }
  };

  const pollStatus = async (id, tries = 0) => {
    if (tries > 40) {
      setStatus("timeout");
      return;
    }
    try {
      const res = await api.get(`/uploads/${id}/`);
      const data = res.data;
      console.log("Polled upload:", data);
      if (data.processed) {
        setStatus("processed");
        setMetadata(data.metadata);
      } else if (data.processing_error) {
        setStatus("error");
        alert("Processing error: " + data.processing_error);
      } else {
        setTimeout(() => pollStatus(id, tries + 1), 1000);
      }
    } catch (err) {
      console.error("Poll error:", err);
      setTimeout(() => pollStatus(id, tries + 1), 1000);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Upload Excel / CSV</h1>
        <div>
          <button onClick={() => nav("/dashboard")} className="px-3 py-1 bg-gray-200 rounded">
            Back
          </button>
        </div>
      </header>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-dashed border-2 p-8 rounded bg-white max-w-2xl mx-auto"
      >
        <p className="mb-4">Drag & drop a file here, or click to select</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onFileChange}
          className="mb-4"
        />

        <div className="flex gap-2 justify-center">
          <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-indigo-600 text-white rounded">
            Choose file
          </button>

          <button onClick={handleUpload} className="px-4 py-2 bg-green-600 text-white rounded">
            Upload
          </button>
        </div>

        {file && (
          <div className="mt-4">
            <div>
              <strong>File:</strong> {file.name} ({Math.round(file.size / 1024)} KB)
            </div>

            <div className="w-full bg-gray-200 rounded h-4 mt-2">
              <div
                className="h-4 rounded"
                style={{ width: `${progress}%`, backgroundColor: "#4f46e5" }}
              />
            </div>

            <div className="mt-2">
              Status: {status} {status === "uploading" && `(${progress}%)`}
            </div>
          </div>
        )}

        {metadata && (
          <div className="mt-6 bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Detected metadata</h3>
            <pre className="text-sm">{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
