import SectionLabel from "@/components/ui/SectionLabel";

const team = [
  { initials: "AA", name: "Alex Ahmed", role: "CEO & Co-founder" },
  { initials: "SK", name: "Sara Kim", role: "CTO & Co-founder" },
  { initials: "MR", name: "Marcus Rivera", role: "Head of Product" },
];

export default function About() {
  return (
    <section id="about" className="bg-[#FDFCFF] py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <SectionLabel>About</SectionLabel>
        <h2 className="text-[40px] font-bold text-[#1A1033]">
          Built for the future of work.
        </h2>

        <p className="text-base text-[#6B7280] leading-relaxed mt-6">
          Workforce planning has been broken for decades. Companies react to talent crises
          instead of preventing them. Simploy exists to change that — by giving every
          organization a live, intelligent view of their workforce.
        </p>
        <p className="text-base text-[#6B7280] leading-relaxed mt-4">
          We built the Career OS because we believe the best time to solve a talent problem
          is before it exists. From the individual contributor planning their next move, to
          the CHRO stress-testing a five-year hiring plan — Simploy is the platform that
          connects them.
        </p>

        <div className="mt-14 flex justify-center gap-8 flex-wrap">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-[#FFF5FA] flex items-center justify-center text-[#E8197A] font-semibold text-sm border-2 border-[#FFD0E8]">
                {member.initials}
              </div>
              <p className="text-sm font-semibold text-[#1A1033]">{member.name}</p>
              <p className="text-xs text-[#6B7280]">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
