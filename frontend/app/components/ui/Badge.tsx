import type { HTMLAttributes } from "react";
import { cn } from "~/lib/cn";

type BadgeTone = "gray" | "blue" | "green" | "red" | "amber" | "purple";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

/** Priority badge helper: maps P1-P4 to a tone. */
export function priorityTone(priority: string): BadgeTone {
  switch (priority) {
    case "P1":
      return "red";
    case "P2":
      return "amber";
    case "P3":
      return "blue";
    default:
      return "gray";
  }
}

export function Badge({ tone = "gray", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}