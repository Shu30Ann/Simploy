import CareerGpsPageShell from "@/components/career-gps/CareerGpsPageShell";

export default function EmployeeCareerGpsPage({
  searchParams,
}: {
  searchParams?: { demo?: string };
}) {
  return <CareerGpsPageShell demoMode={searchParams?.demo === "1"} />;
}
