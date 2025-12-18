"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface SplashScreenProps {
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  title = "Fruit Fuel",
  subtitle = "Fresh. Fast. Delivered.",
  logo,
  loadingText = "Loading...",
  className,
}) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999]",
        "flex items-center justify-center",
        "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700",
        "text-white",
        "animate-fade-in",
        className
      )}
    >
      <div className="flex flex-col items-center gap-6 text-center animate-scale-in">
        {/* Logo */}
        {logo && (
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg">
            {logo}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-white/80 max-w-xs">{subtitle}</p>
        )}

        {/* Loader */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-white/30" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
          </div>

          {loadingText && (
            <span className="text-xs text-white/70 animate-pulse">
              {loadingText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
