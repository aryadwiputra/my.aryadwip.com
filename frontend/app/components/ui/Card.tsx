import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "~/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Card({ title, description, action, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            {title && <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>}
            {description && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}