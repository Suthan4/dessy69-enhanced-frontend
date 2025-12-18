import { cn } from "@/lib/utils/cn";

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-md",
      "bg-gray-200 dark:bg-gray-800",
      "after:absolute after:inset-0 after:-translate-x-full",
      "after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent",
      "after:animate-shimmer",
      className
    )}
  />
);
