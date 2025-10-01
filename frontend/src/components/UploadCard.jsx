export default function UploadCard({ u, onOpen }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl card-shadow flex justify-between items-center">
      <div>
        <div className="font-medium">{u.original_name}</div>
        <div className="text-xs text-slate-500">Uploaded: {new Date(u.uploaded_at).toLocaleString()}</div>
        <div className="text-xs mt-1">Status: {u.processed ? <span className="text-green-600">Processed</span> : <span className="text-orange-500">Processing</span>}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={onOpen} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded">Open</button>
      </div>
    </div>
  );
}
