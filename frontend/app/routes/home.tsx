import { Navigate } from "react-router";
import { useAuthStore } from "~/stores/auth";

export function meta() {
  return [{ title: "Niat — Journal, fokus, dan kebiasaan untuk hidup lebih baik" }];
}

/**
 * Root route: redirect to /dashboard if authenticated, otherwise /login.
 */
export default function Home() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}