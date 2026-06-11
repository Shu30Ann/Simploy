import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
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
  const sizeClass = size === "sm" ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm";

  const variantClass =
    variant === "primary"
      ? "bg-[#E8197A] hover:bg-[#C91569] text-white rounded-full font-medium transition-colors"
      : "border border-[#E8197A] text-[#E8197A] hover:bg-[#FFF5FA] rounded-full font-medium transition-colors bg-transparent";

  return (
    <button className={`${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
