"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

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
        className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#F0EBF8] px-6 py-4 flex items-center justify-between transition-shadow ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        {/* Logo */}
        <span className="text-xl font-bold text-[#E8197A]">Simploy</span>

        {/* Center nav */}
        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#6B7280] hover:text-[#1A1033] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup" className="hidden md:block">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
          <button
            className="md:hidden p-1 text-[#6B7280]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed top-[65px] left-0 right-0 z-40 bg-white border-b border-[#F0EBF8] px-6 py-4 flex flex-col gap-4 shadow-md">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#6B7280] hover:text-[#1A1033] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link href="/signup" onClick={() => setMobileOpen(false)}>
            <Button variant="primary" size="sm" className="w-full">
              Get Started
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
