import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "gold";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const sizeClass = size === "sm" ? "px-5 py-2 text-xs" : "px-7 py-3 text-sm";

  const variantClass =
    variant === "primary"
      ? "bg-[#1E2A44] hover:bg-[#16233C] text-white rounded-full font-semibold transition-colors"
      : variant === "gold"
      ? "bg-[#B08A44] hover:bg-[#97742F] text-white rounded-full font-semibold transition-colors"
      : "border border-[#1E2A44]/25 text-[#1E2A44] hover:bg-[#1E2A44]/5 rounded-full font-semibold transition-colors bg-transparent";

  return (
    <button className={`${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
