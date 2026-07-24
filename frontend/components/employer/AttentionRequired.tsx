"use client";

import Link from "next/link";
import { ArrowUpRight, FilePenLine, Target, Users } from "lucide-react";
import { routes } from "@/lib/routes";
import { employerAttentionItems } from "@/lib/mock-data";
import { Pill, toneStyles } from "@/components/employer/shared";

const attentionItems = employerAttentionItems.map((item, index) => ({
  ...item,
  icon: [Users, FilePenLine, Target][index] ?? Target,
  href:
    item.action === "Find candidates"
      ? routes.employerJobs
      : item.action === "View transition pool"
        ? routes.employerActionEngine
        : routes.employerActionEngine,
}));

export function AttentionRequired() {
  return (
    <section aria-labelledby="attention-title" className="bg-[#F7F3EA] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Attention Required</p>
            <h2 id="attention-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
              Clear the blockers first.
            </h2>
          </div>
          <Link href={routes.employerActionEngine} className="inline-flex items-center gap-1 text-sm font-medium text-[#B08A44] hover:underline">
            Open action engine
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {attentionItems.map(({ title, detail, meta, action, href, icon: Icon, tone }) => (
            <article key={title} className="rounded-2xl border border-[#EAE3D3] bg-white p-5 shadow-[0_4px_24px_rgba(70,60,35,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${toneStyles[tone]}`}>
                  <Icon size={20} />
                </div>
                <Pill tone={tone}>{meta}</Pill>
              </div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#6B7280]">{detail}</p>
              <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#B08A44] hover:underline">
                {action}
                <ArrowUpRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
