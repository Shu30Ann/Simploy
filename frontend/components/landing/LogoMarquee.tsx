const logos = [
  { name: "L'ORÉAL", style: "font-serif font-bold tracking-widest text-[#111111]" },
  { name: "TOYOTA", style: "font-black tracking-wider text-[#EB0A1E]" },
  { name: "Accenture", style: "font-semibold text-[#460073]" },
  { name: "DHL", style: "font-black italic tracking-widest text-[#D40511]" },
  { name: "Shell", style: "font-bold text-[#DD1D21]" },
  { name: "intel", style: "font-bold lowercase text-[#0068B5]" },
  { name: "HSBC", style: "font-bold tracking-wider text-[#DB0011]" },
  { name: "Nestlé", style: "font-serif font-bold text-[#63513D]" },
  { name: "Microsoft", style: "font-semibold text-[#5E5E5E]" },
  { name: "SAMSUNG", style: "font-black tracking-widest text-[#1428A0]" },
  { name: "Dell", style: "font-bold tracking-widest text-[#007DB8]" },
  { name: "Citi", style: "font-bold text-[#004685]" },
  { name: "Grab", style: "font-black text-[#00B14F]" },
  { name: "pwc", style: "font-bold lowercase text-[#D04A02]" },
  { name: "Siemens", style: "font-semibold text-[#009999]" },
  { name: "Maybank", style: "font-bold text-[#FFC83D] [text-shadow:0_0_1px_#00000033]" },
];

export default function LogoMarquee() {
  return (
    <section className="bg-[#FBF8F1] border-y border-[#EAE3D3] py-12 overflow-hidden">
      <p className="text-center font-mono text-xs font-semibold tracking-[0.3em] uppercase text-[#8B7434] mb-8 px-6">
        Trusted by <span className="text-[#B08A44]">Fortune 500</span> and the
        world&apos;s largest companies
      </p>

      <div className="relative">
        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#FBF8F1] to-transparent" />
        <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#FBF8F1] to-transparent" />

        <div className="marquee-track gap-4 pr-4">
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={`${logo.name}-${i}`}
              className="flex items-center justify-center whitespace-nowrap bg-white border border-[#EAE3D3] rounded-full px-8 py-4 shadow-[0_2px_12px_rgba(70,60,35,0.05)]"
            >
              <span className={`text-lg leading-none ${logo.style}`}>
                {logo.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
