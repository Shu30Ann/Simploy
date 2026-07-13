"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
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
        className={`fixed top-0 left-0 right-0 z-50 bg-[#FBF8F1]/95 backdrop-blur-sm border-b border-[#EAE3D3] px-6 py-4 flex items-center transition-shadow ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-black tracking-wide text-[#1E2A44]">
            SIMPLOY
          </span>
          <span className="font-mono text-[10px] font-semibold bg-[#E7F0E9] text-[#17694F] rounded-full px-2 py-0.5">
            .ai
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex gap-8 ml-12">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#5D6470] hover:text-[#1E2A44] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-5 ml-auto">
          <Link
            href="/login"
            className="hidden md:block text-sm font-medium text-[#8B6D2F] hover:text-[#1E2A44] transition-colors"
          >
            Sign in
          </Link>
          <span className="hidden md:block w-px h-6 bg-[#EAE3D3]" aria-hidden />
          <Link
            href="/signup"
            className="hidden md:inline-flex items-center gap-2 bg-[#1E2A44] hover:bg-[#16233C] text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
          >
            Get started <ArrowRight size={15} />
          </Link>
          <button
            className="md:hidden p-1 text-[#5D6470]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#FBF8F1] border-b border-[#EAE3D3] px-6 py-4 flex flex-col gap-4 shadow-md">
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
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center gap-2 bg-[#1E2A44] text-white text-sm font-semibold rounded-xl px-5 py-2.5"
          >
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </>
  );
}
