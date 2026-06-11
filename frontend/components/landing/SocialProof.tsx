const metrics = [
  { value: "14,000+", label: "Skills mapped" },
  { value: "98%", label: "Match accuracy" },
  { value: "230+", label: "Companies" },
  { value: "$2.3B", label: "Talent value tracked" },
];

export default function SocialProof() {
  return (
    <section className="bg-white border-y border-[#F0EBF8] py-8">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`text-center ${
              i < metrics.length - 1 ? "md:border-r md:border-[#F0EBF8]" : ""
            }`}
          >
            <p className="text-3xl font-bold text-[#E8197A]">{m.value}</p>
            <p className="text-sm text-[#6B7280] mt-1">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
