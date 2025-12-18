"use client";

import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "default";
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({
  variant = "default",
  children,
  className,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        {
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300":
            variant === "success",
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300":
            variant === "warning",
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300":
            variant === "error",
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300":
            variant === "info",
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300":
            variant === "default",
        },
        className
      )}
    >
      {children}
    </span>
  );
};
