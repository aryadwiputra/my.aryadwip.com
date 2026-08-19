import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  layout("layouts/app-shell.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("journal", "routes/journal.tsx"),
    route("tasks", "routes/tasks.tsx"),
    route("ideas", "routes/ideas.tsx"),
    route("notes", "routes/notes.tsx"),
    route("habits", "routes/habits.tsx"),
    route("timer", "routes/timer.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;