"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import Link from "next/link";

const plans = [
  {
    label: "INDIVIDUAL",
    price: "Free",
    priceSuffix: "",
    tagline: "Forever free for employees",
    features: [
      "Full career profile",
      "Skills inventory & certifications",
      "AI job matching",
      "Skill gap analysis",
      "Apply to internal & external jobs",
      "Talent graph visualization",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    ctaHref: "/signup?role=employee",
    featured: false,
  },
  {
    label: "STARTER",
    price: "$499",
    priceSuffix: "/mo",
    tagline: "Up to 500 employees",
    features: [
      "Everything in Individual",
      "Employer dashboard",
      "Job postings & applicant pipeline",
      "Workforce analytics overview",
      "Basic gap simulation (3-year horizon)",
      "Email support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "primary" as const,
    ctaHref: "/signup?role=employer",
    featured: true,
  },
  {
    label: "ENTERPRISE",
    price: "Custom",
    priceSuffix: "",
    tagline: "Unlimited employees",
    features: [
      "Everything in Starter",
      "Full Gap Simulator (10-year horizon)",
      "Action Engine recommendations",
      "Regional & department risk scoring",
      "API access",
      "Dedicated success manager",
      "SSO & SCIM provisioning",
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    ctaHref: "mailto:sales@simploy.io",
    featured: false,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-[40px] font-bold text-[#1A1033]">
            Simple pricing. Serious results.
          </h2>
          <p className="text-lg text-[#6B7280] mt-3">
            Free for employees. Powerful for teams. Enterprise-grade for the orgs that
            need it.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 items-stretch"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.label}
              variants={item}
              className="relative flex flex-col"
              style={
                plan.featured
                  ? {
                      border: "2px solid #E8197A",
                      borderRadius: 20,
                      padding: 28,
                      boxShadow: "0 8px 32px rgba(232,25,122,0.15)",
                      transform: "scale(1.02)",
                    }
                  : {
                      border: "1px solid #F0EBF8",
                      borderRadius: 20,
                      padding: 28,
                    }
              }
            >
              {plan.featured && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#E8197A] text-white text-xs font-semibold rounded-full px-4 py-1">
                  Most Popular
                </span>
              )}

              <SectionLabel>{plan.label}</SectionLabel>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-[#1A1033]">{plan.price}</span>
                {plan.priceSuffix && (
                  <span className="text-lg text-[#6B7280] mb-1">{plan.priceSuffix}</span>
                )}
              </div>
              <p className="text-sm text-[#6B7280] mt-1 mb-6">{plan.tagline}</p>

              <div className="border-t border-[#F0EBF8] my-2" />

              <div className="flex flex-col gap-3 mt-4 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <Check size={14} className="text-[#E8197A] mt-0.5 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Link href={plan.ctaHref}>
                <Button variant={plan.ctaVariant} className="w-full mt-8">
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
