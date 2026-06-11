import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";

const BRAND = "#D4537E";

const RAMPS = {
  pink:   { bg: "#FBEAF0", accent: "#D4537E", text: "#72243E" },
  purple: { bg: "#EEEDFE", accent: "#7F77DD", text: "#3C3489" },
  teal:   { bg: "#E1F5EE", accent: "#1D9E75", text: "#085041" },
  blue:   { bg: "#E6F1FB", accent: "#378ADD", text: "#0C447C" },
  amber:  { bg: "#FAEEDA", accent: "#BA7517", text: "#633806" },
  coral:  { bg: "#FAECE7", accent: "#D85A30", text: "#712B13" },
  gray:   { bg: "#F1EFE8", accent: "#888780", text: "#444441" },
};

const PRI = {
  HIGH: { bg: "#FBEAF0", color: "#993556" },
  MED:  { bg: "#FAEEDA", color: "#854F0B" },
  LOW:  { bg: "#EAF3DE", color: "#3B6D11" },
};

const SECTIONS = [
  {
    id: "public", label: "Public & auth", ramp: "pink",
    items: [
      { id: "landing", label: "Landing page",            route: "/",       priority: "HIGH", note: "Hero, how it works, solutions, pricing, about" },
      { id: "login",   label: "Login",                   route: "/login",  priority: "HIGH", note: "Email + Google OAuth, portal switch logic" },
      { id: "signup",  label: "Signup + role selection", route: "/signup", priority: "HIGH", note: "Role choice (employee vs employer) gates onboarding" },
    ],
  },
  {
    id: "onboarding", label: "Onboarding wizards", ramp: "purple",
    items: [
      { id: "ob-emp", label: "Employee onboarding", route: "/onboarding/employee", priority: "HIGH", note: "Profile → skills → career goals → certs (4 steps)" },
      { id: "ob-er",  label: "Employer onboarding", route: "/onboarding/employer", priority: "HIGH", note: "Company → departments → open roles → hiring plan" },
    ],
  },
  {
    id: "employee", label: "Employee portal — layer 1", ramp: "teal",
    items: [
      { id: "emp-dash", label: "Employee dashboard", route: "/employee/dashboard",   priority: "HIGH", note: "Job matches, skill gap panel, talent graph viz" },
      { id: "emp-jobs", label: "Jobs marketplace",   route: "/employee/jobs",         priority: "HIGH", note: "Search, filters, internal / external toggle" },
      { id: "emp-apps", label: "My applications",    route: "/employee/applications", priority: "MED",  note: "Status tracker, interview dates, next steps" },
      { id: "emp-skls", label: "Skills center",      route: "/employee/skills",       priority: "MED",  note: "Inventory, learning paths, certifications" },
      { id: "emp-anlt", label: "Career analytics",   route: "/employee/analytics",    priority: "LOW",  note: "Profile views, match trends, skill demand heatmap" },
    ],
  },
  {
    id: "employer", label: "Employer portal — layer 1", ramp: "blue",
    items: [
      { id: "er-dash", label: "Employer dashboard",        route: "/employer/dashboard",    priority: "HIGH", note: "Job postings table, top matches, marketplace insights" },
      { id: "er-jobs", label: "Job postings manager",      route: "/employer/jobs",          priority: "HIGH", note: "Create, edit, pause and close postings" },
      { id: "er-apps", label: "Applications inbox",        route: "/employer/applications",  priority: "MED",  note: "All inbound apps, filter by role / status / match" },
      { id: "er-pipe", label: "Hiring pipeline (kanban)",  route: "/employer/pipeline",      priority: "MED",  note: "Applied → shortlisted → interview → offered → hired" },
    ],
  },
  {
    id: "simulator", label: "Workforce gap simulator — layer 2", ramp: "amber",
    items: [
      { id: "sim-ov",  label: "Workforce overview",   route: "/employer/analytics/overview",  priority: "MED",  note: "Headcount, department breakdown, skills distribution" },
      { id: "sim-eng", label: "Gap simulator engine", route: "/employer/analytics/simulator", priority: "HIGH", note: "What-if sliders, supply/demand chart, risk panel" },
      { id: "sim-rep", label: "Saved reports",        route: "/employer/analytics/reports",   priority: "LOW",  note: "Saved scenarios, exportable PDF summaries" },
    ],
  },
  {
    id: "layer3", label: "Action engine — layer 3", ramp: "coral",
    items: [
      { id: "act-res", label: "Simulation results + action engine", route: "/employer/simulator/results", priority: "HIGH", note: "Hire / upskill / redeploy / automate recommendation cards" },
    ],
  },
  {
    id: "shared", label: "Shared", ramp: "gray",
    items: [
      { id: "settings", label: "Settings & switch portal", route: "/settings", priority: "LOW", note: "Account, notifications, switch between portals" },
    ],
  },
];

const TOTAL = SECTIONS.flatMap(s => s.items).length;

export default function BuildChecklist() {
  const [checked, setChecked]     = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("career-os-checklist-v1");
        if (res) setChecked(JSON.parse(res.value));
      } catch {}
      setReady(true);
    })();
  }, []);

  const toggle = async (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { await window.storage.set("career-os-checklist-v1", JSON.stringify(next)); } catch {}
  };

  const toggleSection = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }));

  const totalDone = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((totalDone / TOTAL) * 100);

  if (!ready) return (
    <div style={{ padding: 40, textAlign: "center", color: "#888780", fontFamily: "system-ui" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ background: "#FAFAF9", fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{
        background: "#fff",
        borderBottom: "0.5px solid #E8E6E0",
        padding: "14px 20px",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: BRAND }}>Candy Career</span>
            <span style={{ color: "#D3D1C7", fontSize: 13 }}>·</span>
            <span style={{ fontSize: 13, color: "#888780" }}>build checklist</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#888780" }}>{totalDone} / {TOTAL} pages</span>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
              background: pct === 100 ? "#EAF3DE" : "#FBEAF0",
              color:      pct === 100 ? "#3B6D11"  : "#993556"
            }}>{pct}%</span>
          </div>
        </div>
        <div style={{ height: 3, background: "#F1EFE8", borderRadius: 10, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: BRAND, borderRadius: 10,
            transition: "width 0.4s ease"
          }} />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: "#2C2C2A", margin: "0 0 4px" }}>
          Pages to build
        </h1>
        <p style={{ fontSize: 13, color: "#888780", margin: "0 0 20px" }}>
          {TOTAL} pages total · check off as you ship
        </p>

        {SECTIONS.map(section => {
          const r     = RAMPS[section.ramp];
          const items = section.items;
          const sDone = items.filter(i => checked[i.id]).length;
          const sPct  = Math.round((sDone / items.length) * 100);
          const isOpen = !collapsed[section.id];

          return (
            <div key={section.id} style={{
              marginBottom: 10,
              background: "#fff",
              border: "0.5px solid #E8E6E0",
              borderRadius: 12,
              overflow: "hidden"
            }}>
              {/* section header */}
              <div
                onClick={() => toggleSection(section.id)}
                style={{
                  padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: "pointer",
                  background: sDone === items.length ? r.bg : "#FAFAF9",
                  borderBottom: isOpen ? "0.5px solid #E8E6E0" : "none",
                  userSelect: "none"
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.accent, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#2C2C2A" }}>
                  {section.label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 50, height: 3, background: "#F1EFE8", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${sPct}%`, background: r.accent, borderRadius: 10, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: r.text, fontWeight: 500, minWidth: 24, textAlign: "right" }}>
                    {sDone}/{items.length}
                  </span>
                  {isOpen
                    ? <ChevronDown  size={14} color="#B4B2A9" />
                    : <ChevronRight size={14} color="#B4B2A9" />
                  }
                </div>
              </div>

              {/* items */}
              {isOpen && items.map((item, idx) => {
                const done = !!checked[item.id];
                const ps   = PRI[item.priority];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "10px 16px",
                      borderBottom: idx < items.length - 1 ? "0.5px solid #F5F3EE" : "none",
                      cursor: "pointer",
                      background: done ? r.bg + "55" : "transparent",
                      transition: "background 0.15s"
                    }}
                  >
                    {/* checkbox */}
                    <div style={{
                      width: 18, height: 18, minWidth: 18, marginTop: 1, flexShrink: 0,
                      borderRadius: 5,
                      border: done ? `1.5px solid ${r.accent}` : "1.5px solid #D3D1C7",
                      background: done ? r.accent : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s"
                    }}>
                      {done && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>

                    {/* text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 3 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 500,
                          color: done ? "#B4B2A9" : "#2C2C2A",
                          textDecoration: done ? "line-through" : "none",
                          textDecorationColor: "#D3D1C7"
                        }}>
                          {item.label}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 20,
                          background: ps.bg, color: ps.color
                        }}>
                          {item.priority}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: "#888780", lineHeight: 1.5 }}>
                        {item.note}
                      </p>
                      <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: done ? "#B4B2A9" : r.accent }}>
                        {item.route}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* completion banner */}
        {pct === 100 && (
          <div style={{
            marginTop: 16, padding: "20px 16px", textAlign: "center",
            background: "#EAF3DE", border: "0.5px solid #C0DD97", borderRadius: 12
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 500, color: "#3B6D11" }}>
              All {TOTAL} pages shipped
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#639922" }}>Go win that $5,000</p>
          </div>
        )}

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#B4B2A9" }}>
          Progress saves automatically
        </p>
      </div>
    </div>
  );
}
