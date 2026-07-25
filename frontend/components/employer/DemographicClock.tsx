"use client";

import Link from "next/link";
import { ArrowUpRight, LineChart } from "lucide-react";
import { routes } from "@/lib/routes";
import { manufacturingForecast } from "@/lib/mock-data";
import { Pill } from "@/components/employer/shared";

const workforceForecast = manufacturingForecast
  .filter((_, index) => [0, 2, 4, 5].includes(index))
  .map((point) => ({
    year: point.year,
    population: point.supply.toLocaleString(),
    value: Math.round((point.supply / manufacturingForecast[0].supply) * 100),
  }));

export function DemographicClock() {
  return (
    <section aria-labelledby="workforce-forecast-title" className="bg-[#F6F1E4] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wide text-[#B08A44]">Workforce Forecast</p>
          <h2 id="workforce-forecast-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-[40px]">
            Workforce Availability Forecast
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-[#6B7280]">
            Long-range supply signals for planning roles, mobility, and hiring demand.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#EAE3D3] bg-white shadow-[0_8px_48px_rgba(70,60,35,0.1)]">
          <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="bg-[#1E2A44] p-6 text-white sm:p-8">
              <h3 className="flex items-center gap-3 text-2xl font-bold">
                <LineChart size={22} className="text-[#17694F]" />
                Demographic Clock
              </h3>
              <p className="mt-6 text-lg leading-8 text-white/80">
                Workforce availability forecast for aging Asian labor markets.
              </p>
              <div className="mt-10">
                <p className="text-xs font-bold uppercase text-white/45">Projected decline</p>
                <p className="mt-3 text-6xl font-bold text-[#17694F]">31%</p>
                <p className="mt-3 text-base font-semibold leading-7 text-white/75">Working-age population by 2050</p>
              </div>
              <div className="mt-10 rounded-lg bg-white/10 p-5">
                <p className="text-xs font-bold uppercase text-white/45">Planning signal</p>
                <p className="mt-3 text-base leading-7 text-white/80">
                  Build internal mobility and skills transfer before hiring demand peaks.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight">Workforce Availability Forecast</h3>
                  <p className="mt-3 text-lg leading-8 text-[#6B7280]">
                    Working-age population trend from 2026 to 2050.
                  </p>
                </div>
                <Pill tone="pink">2026 - 2050</Pill>
              </div>

              <div className="rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-4 sm:p-5">
                <div className="relative h-72">
                  <div className="absolute inset-x-0 top-8 border-t border-dashed border-[#DFD6BE]" />
                  <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#DFD6BE]" />
                  <div className="absolute inset-x-0 bottom-14 border-t border-dashed border-[#DFD6BE]" />

                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 420 250"
                    role="img"
                    aria-label="Working age population declines from 10,000 in 2026 to 6,900 in 2050"
                  >
                    <defs>
                      <linearGradient id="workforceLine" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#17694F" />
                        <stop offset="55%" stopColor="#B08A44" />
                        <stop offset="100%" stopColor="#17694F" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points="48,54 160,92 286,145 386,176"
                      fill="none"
                      stroke="url(#workforceLine)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="7"
                    />
                    <polyline points="48,54 160,92 286,145 386,176 386,215 48,215" fill="rgba(70,60,35,0.08)" />
                    {[
                      ["48", "54", "#17694F"],
                      ["160", "92", "#B08A44"],
                      ["286", "145", "#17694F"],
                      ["386", "176", "#1E2A44"],
                    ].map(([cx, cy, color]) => (
                      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="8" fill={color} stroke="#FFFFFF" strokeWidth="4" />
                    ))}
                  </svg>

                  <div className="absolute bottom-0 left-0 right-0 grid grid-cols-4 gap-2">
                    {workforceForecast.map((point) => (
                      <div key={point.year} className="text-center">
                        <p className="text-base font-bold text-[#1E2A44]">{point.year}</p>
                        <p className="text-sm font-semibold text-[#6B7280]">{point.population}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 pb-4 sm:grid-cols-4 sm:pb-6">
                {workforceForecast.map((point) => (
                  <div key={point.year} className="rounded-lg bg-[#F6F1E4] p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#17694F]">{point.year}</span>
                      <span className="text-sm font-bold text-[#B08A44]">{point.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#F1EDE0]">
                      <div className="h-2.5 rounded-full bg-[#B08A44]" style={{ width: `${point.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={routes.employerSimulator}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E2A44] px-5 py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(26,16,51,0.16)]"
              >
                Checkout workforce simulator
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
