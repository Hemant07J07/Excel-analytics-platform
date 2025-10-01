export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl card-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">{title}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}
