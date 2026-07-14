"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { routes } from "@/lib/routes";

export function EmployeeFloatingCoach() {
  const pathname = usePathname();

  if (
    pathname === routes.employeeDashboard ||
    pathname === routes.employeeCareerBuddy ||
    pathname === routes.employeeSettings
  ) {
    return null;
  }

  return (
    <ChatWidget
      title="Career Coach"
      assistantName="Jack"
      intro="Hi, I am Jack, your career coach. Please ask anything you want about your next role, applications, skills, or roadmap."
      placeholder="Ask Jack about your career..."
      quickPrompts={["Improve my profile", "Find skill gaps", "Plan my next role"]}
    />
  );
}
