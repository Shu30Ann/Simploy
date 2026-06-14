const cols = [
  {
    heading: "Product",
    links: [
      { label: "Jobs Marketplace", href: "/employee/dashboard" },
      { label: "Gap Simulator", href: "/employer/analytics/simulator" },
      { label: "Action Engine", href: "/employer/analytics/simulator" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "For Employees", href: "/#solutions" },
      { label: "For Employers", href: "/#solutions" },
      { label: "How It Works", href: "/#how-it-works" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/login" },
      { label: "Terms of Service", href: "/signup" },
      { label: "Cookie Policy", href: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A1033] text-white py-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Col 1 */}
        <div>
          <p className="text-lg font-bold text-white mb-3">Simploy</p>
          <p className="text-sm text-white/50">The Career OS for modern teams.</p>
          <p className="text-xs text-white/30 mt-4">© 2025 Simploy, Inc.</p>
        </div>

        {cols.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              {col.heading}
            </p>
            {col.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors block mb-2"
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 text-center">
        <p className="text-xs text-white/30">
          © 2025 Simploy, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
