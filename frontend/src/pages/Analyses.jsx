// simple viewer for user's analyses
import React, {useEffect, useState} from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Analyses() {
  const [list, setList] = useState([]);
  useEffect(() => {
    api.get("/analyses/").then(r => setList(r.data)).catch(console.error);
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">My Analyses</h1>
      <div className="space-y-3">
        {list.map(a => (
          <div key={a.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-medium">{a.chart_type} — upload #{a.upload}</div>
              <div className="text-sm text-gray-500">Created: {new Date(a.created_at).toLocaleString()}</div>
            </div>
            <div>
              <Link to={`/analyses/${a.id}`} className="text-indigo-600 hover:underline">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
