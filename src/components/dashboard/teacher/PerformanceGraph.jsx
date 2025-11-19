import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PerformanceGraph({ results }) {

  // Convert results to graph-friendly format
  const data = results.map((r) => ({
    name: new Date(r.createdAt).toLocaleDateString(),
    percentage: Math.round((r.score / r.total) * 100),
  }));

  return (
    <div className="bg-white rounded-xl p-4 shadow mt-3">
      <h4 className="font-semibold mb-2">Performance Over Time</h4>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No attempts yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="percentage" stroke="#4f46e5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
