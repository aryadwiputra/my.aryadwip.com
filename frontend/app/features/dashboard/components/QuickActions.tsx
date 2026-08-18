import { BookOpen, CheckSquare, Lightbulb, Timer } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "~/components/ui/Card";

const actions = [
  { to: "/journal", label: "Tulis Journal", icon: BookOpen },
  { to: "/tasks", label: "Task Baru", icon: CheckSquare },
  { to: "/timer", label: "Fokus Timer", icon: Timer },
  { to: "/ideas", label: "Tangkap Ide", icon: Lightbulb },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <Card title="Aksi Cepat">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <button
            key={a.to}
            onClick={() => navigate(a.to)}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
          >
            <a.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            {a.label}
          </button>
        ))}
      </div>
    </Card>
  );
}