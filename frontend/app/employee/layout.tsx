import type { ReactNode } from "react";
import { EmployeeFloatingCoach } from "@/components/employee/EmployeeFloatingCoach";

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <EmployeeFloatingCoach />
    </>
  );
}
