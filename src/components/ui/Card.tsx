"use client";

import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = ({
  hover = false,
  className,
  children,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800",
        "shadow-card transition-all duration-300",
        hover && "hover:shadow-card-hover hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
