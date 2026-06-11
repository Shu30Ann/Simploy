const cols = [
  {
    heading: "Product",
    links: ["Jobs Marketplace", "Gap Simulator", "Action Engine", "Pricing"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers", "Press"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
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
                key={link}
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors block mb-2"
              >
                {link}
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
