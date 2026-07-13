"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { authRouteWithRole, routes, type UserRole } from "@/lib/routes";

type ProfileMenuProps = {
  role: UserRole;
  initials: string;
  name: string;
  label: string;
};

export function ProfileMenu({ role, initials, name, label }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsHref =
    role === "employee"
      ? routes.employeeSettings
      : `${routes.employerDashboard}#settings`;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAE3D3] bg-white pl-1 pr-3 text-sm font-bold text-[#1E2A44] shadow-sm transition hover:border-[#DFD6BE] hover:bg-[#F7F3EA]"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E2A44] text-xs font-bold text-white">
          {initials}
        </span>
        <ChevronDown size={15} className="text-[#6B7280]" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-[#EAE3D3] bg-white py-2 shadow-[0_18px_44px_rgba(26,16,51,0.14)]"
        >
          <div className="border-b border-[#EAE3D3] px-4 py-3">
            <p className="text-sm font-bold text-[#1E2A44]">{name}</p>
            <p className="mt-0.5 text-xs font-semibold capitalize text-[#9CA3AF]">{role}</p>
          </div>
          <Link
            href={settingsHref}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F8F5FC] hover:text-[#B08A44]"
          >
            <Settings size={16} aria-hidden="true" />
            Settings
          </Link>
          <Link
            href={role === "employee" ? routes.employeeDashboard : routes.employerDashboard}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F8F5FC] hover:text-[#B08A44]"
          >
            <UserRound size={16} aria-hidden="true" />
            Profile
          </Link>
          <Link
            href={authRouteWithRole(routes.login, role)}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 border-t border-[#EAE3D3] px-4 py-3 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FFF5F5]"
          >
            <LogOut size={16} aria-hidden="true" />
            Log out
          </Link>
        </div>
      )}
    </div>
  );
}
