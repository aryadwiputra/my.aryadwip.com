import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card } from "~/components/ui/Card";
import type { DashboardData } from "~/lib/types";

const MOOD_COLORS: Record<string, string> = {
  great: "#22c55e",
  good: "#3b82f6",
  okay: "#f59e0b",
  low: "#f97316",
  bad: "#ef4444",
};

export function AnalyticsChart({ moodTrend }: { moodTrend: DashboardData["moodTrend"] }) {
  if (moodTrend.length === 0) {
    return (
      <Card title="Tren Mood" description="30 hari terakhir">
        <p className="py-8 text-center text-sm text-gray-500">Belum ada data journal.</p>
      </Card>
    );
  }

  const data = moodTrend.map((m) => ({
    date: m.date.slice(5),
    mood: m.mood,
    energy: m.energy ?? 0,
    moodValue: m.mood === "great" ? 5 : m.mood === "good" ? 4 : m.mood === "okay" ? 3 : m.mood === "low" ? 2 : 1,
  }));

  return (
    <Card title="Tren Mood" description="30 hari terakhir">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="date" fontSize={10} />
            <YAxis domain={[0, 6]} fontSize={10} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const item = payload[0].payload as typeof data[0];
                return (
                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {item.mood}
                    </p>
                    {item.energy > 0 && (
                      <p className="text-xs text-gray-500">Energi: {item.energy}/5</p>
                    )}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="moodValue"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={({ cx, cy, payload }: any) => (
                <circle
                  key={payload.date}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={MOOD_COLORS[payload.mood] ?? "#8b5cf6"}
                  stroke="none"
                />
              )}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
