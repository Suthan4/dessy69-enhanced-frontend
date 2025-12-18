"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          /* Base */
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
          "transition-all duration-200 active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",

          /* Variants */
          {
            "bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-glow":
              variant === "primary",
            "bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:shadow-glow-green":
              variant === "secondary",
            "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950":
              variant === "outline",
            "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800":
              variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600": variant === "danger",
          },

          /* Sizes */
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },

          className
        )}
        {...props}
      >
        {/* Left Icon */}
        {!isLoading && leftIcon && (
          <span className="flex items-center">{leftIcon}</span>
        )}

        {/* Loading Spinner */}
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}

        {/* Label */}
        <span>{children}</span>

        {/* Right Icon */}
        {!isLoading && rightIcon && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
