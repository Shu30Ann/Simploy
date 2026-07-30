"use client";

import { BrandLogo } from "@/components/BrandLogo";

const premiumEmployers = [
  "Maybank",
  "Shell",
  "intel",
  "HSBC",
  "Nestlé",
  "SAMSUNG",
  "Siemens",
  "Microsoft",
];

const cols = [
  {
    heading: "For talent",
    links: [
      { label: "Browse jobs", href: "/employee/dashboard" },
      { label: "Career DNA", href: "/employee/dashboard" },
      { label: "Applications", href: "/employee/applications" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    heading: "For employers",
    links: [
      { label: "Post a job", href: "/employer/dashboard" },
      { label: "Gap Simulator", href: "/employer/analytics/simulator" },
      { label: "Action Engine", href: "/employer/action-engine" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/#about" },
      { label: "Solutions", href: "/#solutions" },
      { label: "Privacy", href: "/login" },
      { label: "Terms", href: "/signup" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1B2542] text-white">
      {/* Premium employers strip */}
      <div className="border-b border-white/10 py-10">
        <p className="text-center font-mono text-xs font-semibold tracking-[0.3em] uppercase text-[#C8A45F] mb-6">
          Premium employers
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap px-6">
          {premiumEmployers.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold text-white/85 border border-white/20 rounded-full px-5 py-2"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-white/10 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <p className="font-serif text-xl font-bold">
              The best roles, in your inbox weekly.
            </p>
            <p className="text-sm text-white/50 mt-1">
              New vacancies from the world&apos;s most admired companies, every
              week.
            </p>
          </div>
          <form
            className="flex gap-2 w-full md:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-[#C8A45F] flex-1 md:w-64"
            />
            <button
              type="submit"
              className="bg-[#B08A44] hover:bg-[#97742F] text-white text-sm font-semibold rounded-xl px-6 py-2.5 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <BrandLogo withPlate className="mb-3" imageClassName="h-16 w-auto" />
          <p className="text-sm text-white/50 leading-relaxed">
            The authority in employability and career development. The largest
            collection of leading employers, in one place.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.heading}>
            <p className="font-serif text-sm font-bold text-white mb-4">
              {col.heading}
            </p>
            {col.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/55 hover:text-white transition-colors block mb-2.5"
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 py-6 text-center">
        <p className="font-mono text-xs text-white/35">
          © 2026 Simploy, Inc. · All rights reserved.
        </p>
      </div>
    </footer>
  );
}
