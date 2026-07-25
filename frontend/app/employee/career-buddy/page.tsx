"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Compass, Loader2, MessageCircle, Route, TriangleAlert } from "lucide-react";
import { CareerBuddyPanel } from "@/components/career-gps/CareerGpsPageShell";
import { EmployeeTopNav } from "@/components/employee/EmployeeTopNav";
import { getAuthToken, getJson } from "@/lib/api";
import type { CareerGpsProfile, CareerGpsRoadmap, CareerGpsRoute } from "@/lib/backendTypes";
import { loadRiasecResult, type RiasecResult } from "@/lib/riasec";
import { routes } from "@/lib/routes";

type BuddyState = {
  profile: CareerGpsProfile | null;
  roadmap: CareerGpsRoadmap | null;
};

function initialsFromName(name: string | null | undefined) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "E";
}

function selectedRoute(roadmap: CareerGpsRoadmap | null): CareerGpsRoute | null {
  return (
    roadmap?.routes.find((route) => route.route_type === roadmap.selected_route_type) ??
    roadmap?.routes.find((route) => route.route_type === "recommended") ??
    roadmap?.routes[0] ??
    null
  );
}

function BuddyLoading() {
  return (
    <section className="grid min-h-[360px] place-items-center rounded-lg border border-[#E7F0E9] bg-white p-8 text-center shadow-[0_8px_32px_rgba(8,124,126,0.08)]">
      <div>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#17694F]" />
        <p className="mt-4 text-sm font-bold text-[#1E2A44]">Loading Career Buddy</p>
        <p className="mt-2 text-sm text-[#6B7280]">Preparing your latest route context.</p>
      </div>
    </section>
  );
}

function BuddyEmpty({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="rounded-lg border border-[#E3D8BC] bg-white p-6 shadow-[0_8px_32px_rgba(8,124,126,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F6F1E4] text-[#B08A44]">
            <TriangleAlert size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#1E2A44]">Career Buddy needs a route first</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">{message}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#DFD6BE] bg-white px-4 text-sm font-bold text-[#17694F]"
          >
            Retry
          </button>
          <Link
            href={routes.employeeCareerGps}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#17694F] px-4 text-sm font-bold text-white"
          >
            Open Career GPS
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function EmployeeCareerBuddyPage() {
  const [state, setState] = useState<BuddyState>({ profile: null, roadmap: null });
  const [riasecResult, setRiasecResult] = useState<RiasecResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBuddyContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRiasecResult(loadRiasecResult());

    if (!getAuthToken()) {
      setState({ profile: null, roadmap: null });
      setError("Please log in as an employee so Career Buddy can use your saved Career GPS route.");
      setIsLoading(false);
      return;
    }

    try {
      const [profile, roadmap] = await Promise.all([
        getJson<CareerGpsProfile>("/career-gps/profile", { auth: true }),
        getJson<CareerGpsRoadmap | null>("/career-gps/roadmaps/latest", { auth: true }),
      ]);
      setState({ profile, roadmap });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Career Buddy context.");
      setState({ profile: null, roadmap: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBuddyContext();
  }, [loadBuddyContext]);

  const activeRoute = useMemo(() => selectedRoute(state.roadmap), [state.roadmap]);
  const profileName = state.profile?.employee.full_name ?? "Employee";
  const initials = initialsFromName(profileName);

  return (
    <main className="min-h-screen bg-[#EFF5F0] text-[#1E2A44]">
      <EmployeeTopNav initials={initials} name={profileName} />

      <section className="border-b border-[#E7F0E9] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17694F]">
              <Bot size={14} />
              Career Buddy
            </p>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Guidance for your next decision</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5D6470]">
              Ask questions about your route, milestones, skill gaps, applications, or tradeoffs. Career Buddy uses your
              saved Career GPS context instead of changing your roadmap directly.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { label: "Context", value: activeRoute?.title ?? "Latest route", icon: Route },
              { label: "Mode", value: "Explain and guide", icon: MessageCircle },
              { label: "Map source", value: "Career GPS", icon: Compass },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-[#E7F0E9] bg-[#F7F3EA] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#17694F]">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#17694F]">{item.label}</p>
                      <p className="mt-1 truncate text-sm font-bold text-[#1E2A44]">{item.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <BuddyLoading />
        ) : error || !state.roadmap || !activeRoute ? (
          <BuddyEmpty
            message={error ?? "Generate a Career GPS roadmap before asking Career Buddy for route-specific guidance."}
            onRetry={loadBuddyContext}
          />
        ) : (
          <CareerBuddyPanel
            roadmap={state.roadmap}
            activeRoute={activeRoute}
            riasecResult={riasecResult}
            isDemoMode={false}
            defaultOpen
          />
        )}
      </section>
    </main>
  );
}
