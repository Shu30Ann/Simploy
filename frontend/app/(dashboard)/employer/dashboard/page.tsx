import Link from "next/link";

export default function EmployerDashboard() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome back, Acme Corp Team!
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Your talent marketplace is live.
        </p>
      </div>

      <Link
        href="/employer/analytics/simulator"
        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full text-white w-fit transition-colors"
        style={{ background: "var(--pink)" }}
      >
        Open Workforce Gap Simulator →
      </Link>
    </div>
  );
}
