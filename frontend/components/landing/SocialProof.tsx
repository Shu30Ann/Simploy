const metrics = [
  { value: "14,000+", label: "Skills mapped" },
  { value: "98%", label: "Match accuracy" },
  { value: "230+", label: "Companies" },
  { value: "$2.3B", label: "Talent value tracked" },
];

export default function SocialProof() {
  return (
    <section className="bg-[#F7F3EA] py-12">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`text-center ${
              i < metrics.length - 1 ? "md:border-r md:border-[#E3DCC9]" : ""
            }`}
          >
            <p className="font-serif text-3xl font-bold text-[#1E2A44]">
              {m.value}
            </p>
            <p className="text-sm text-[#5D6470] mt-1">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
