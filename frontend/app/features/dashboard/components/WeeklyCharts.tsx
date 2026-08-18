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

export function WeeklyCharts({ week }: { week: DashboardData["week"] }) {
  return (
    <Card
      title="Ringkasan Mingguan"
      description="Task selesai & fokus 7 hari terakhir."
    >
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Task selesai per hari</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="tasksCompleted" fill="#2563eb" radius={[4, 4, 0, 0]} name="Task" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Fokus per hari (menit)</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={week} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="focusMinutes"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.2}
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