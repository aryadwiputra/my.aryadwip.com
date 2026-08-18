import { NavLink } from "react-router";
import { cn } from "~/lib/cn";

export interface NavItemDef {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

interface NavItemProps {
  item: NavItemDef;
  onClick?: () => void;
}

export function NavItem({ item, onClick }: NavItemProps) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        )
      }
    >
      <span className="text-current">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );
}