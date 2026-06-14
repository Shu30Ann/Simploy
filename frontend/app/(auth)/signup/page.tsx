import SignupFlow from "@/components/auth/SignupFlow";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  return <SignupFlow initialRole={searchParams.role} />;
}
