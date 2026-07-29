"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import DemoLoginButton from "@/components/auth/DemoLoginButton";

const navLinks = [
  { label: "Solutions", href: "#solutions" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-[#EAE3D3] bg-[#F7F3EA]/95 backdrop-blur-sm transition-shadow ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="mx-auto flex min-h-20 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <BrandLogo imageClassName="h-14 w-auto" />

          <div className="hidden gap-8 md:ml-12 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#5D6470] transition-colors hover:text-[#1E2A44]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <DemoLoginButton
              role="employee"
              className="hidden rounded-full border border-[#B08A44] px-4 py-2.5 text-sm font-semibold text-[#8B7434] transition-colors hover:bg-[#F6F1E4] disabled:cursor-not-allowed disabled:opacity-70 md:inline-flex"
            >
              Employee
            </DemoLoginButton>
            <DemoLoginButton
              role="employer"
              className="hidden rounded-full bg-[#1E2A44] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16233C] disabled:cursor-not-allowed disabled:opacity-70 md:inline-flex"
            >
              Employer
            </DemoLoginButton>
            <button
              className="p-1 text-[#5D6470] md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed left-0 right-0 top-20 z-40 flex flex-col gap-4 border-b border-[#EAE3D3] bg-[#F7F3EA] px-6 py-4 shadow-md">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#5D6470] hover:text-[#1E2A44] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <DemoLoginButton
            role="employee"
            className="inline-flex items-center justify-center rounded-xl border border-[#B08A44] px-5 py-2.5 text-sm font-semibold text-[#8B7434]"
          >
            Enter as Employee
          </DemoLoginButton>
          <DemoLoginButton
            role="employer"
            className="inline-flex items-center justify-center rounded-xl bg-[#1E2A44] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Enter as Employer
          </DemoLoginButton>
        </div>
      )}
    </>
  );
}
