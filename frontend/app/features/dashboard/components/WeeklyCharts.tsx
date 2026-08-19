import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "~/components/ui/Card";
import type { DashboardData } from "~/lib/types";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontSize: 12,
};

export function WeeklyCharts({ week }: { week: DashboardData["week"] }) {
  return (
    <Card title="Minggu Ini" description="Task selesai & menit fokus, 7 hari terakhir.">
      <div className="space-y-6">
        {/* Tasks */}
        <div>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Task selesai per hari</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(37,99,235,0.08)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="tasksCompleted" fill="#2563eb" radius={[5, 5, 0, 0]} name="Task" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus */}
        <div>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Menit fokus per hari</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={week} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="focusMinutes"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#focusGrad)"
                  name="Menit fokus"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}
