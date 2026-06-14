"use client";

interface MarketRow {
  code:    string;
  country: string;
  change:  string;
  status:  "Critical" | "At Risk" | "Growing";
}

const DECLINING: MarketRow[] = [
  { code: "JP", country: "Japan",       change: "-1.3%/yr", status: "Critical" },
  { code: "KR", country: "South Korea", change: "-0.9%/yr", status: "Critical" },
  { code: "CN", country: "China",       change: "-0.7%/yr", status: "At Risk"  },
  { code: "SG", country: "Singapore",   change: "-0.4%/yr", status: "At Risk"  },
];

const GROWING: MarketRow[] = [
  { code: "IN", country: "India",       change: "+1.1%/yr", status: "Growing" },
  { code: "VN", country: "Vietnam",     change: "+0.8%/yr", status: "Growing" },
  { code: "PH", country: "Philippines", change: "+1.9%/yr", status: "Growing" },
  { code: "ID", country: "Indonesia",   change: "+1.2%/yr", status: "Growing" },
];

function Row({ r }: { r: MarketRow }) {
  const isGrowing = r.status === "Growing";
  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0"
      style={{ borderColor: "#F5F3EE" }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={{ background: "var(--bg-page)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
        {r.code}
      </div>
      <span className="flex-1 text-sm" style={{ color: "var(--text-primary)" }}>{r.country}</span>
      <span className="text-sm font-semibold tabular-nums"
        style={{ color: isGrowing ? "#10B981" : "#E8197A" }}>
        {r.change}
      </span>
    </div>
  );
}

export default function DemographicContextPanel() {
  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
        style={{ color: "var(--text-muted)" }}>
        Demographic Context
      </p>
      <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        Global Workforce Trends
      </p>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Working-age population trends for markets you operate in
      </p>

      {/* Declining */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "#FFF0F5", color: "#E8197A" }}>
          DECLINING
        </span>
      </div>
      <div className="mb-4">
        {DECLINING.map(r => <Row key={r.code} r={r} />)}
      </div>

      {/* Growing */}
      <div className="flex items-center gap-2 mb-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "#E1F5EE", color: "#10B981" }}>
          GROWING
        </span>
      </div>
      <div>
        {GROWING.map(r => <Row key={r.code} r={r} />)}
      </div>

      <p className="text-[10px] leading-relaxed mt-3 pt-3 border-t"
        style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
        Opportunity markets can offset declining local supply. Adjust the Migration Impact slider to model this.
      </p>
    </div>
  );
}
