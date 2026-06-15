import type { ReactNode } from "react";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ChatWidget
        title="Career Coach"
        assistantName="Jack"
        intro="Hi, I am Jack, your career coach. Please ask anything you want about your next role, applications, skills, or roadmap."
        placeholder="Ask Jack about your career..."
        quickPrompts={["Improve my profile", "Find skill gaps", "Plan my next role"]}
      />
    </>
  );
}
