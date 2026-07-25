"use client";

import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/routes";

type BrandLogoProps = {
  href?: string;
  className?: string;
  imageClassName?: string;
  withPlate?: boolean;
};

export function BrandLogo({
  href = routes.home,
  className = "",
  imageClassName = "h-8 w-auto",
  withPlate = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex self-start shrink-0 items-center justify-center ${withPlate ? "h-28 w-28 rounded-xl bg-white p-3 shadow-sm" : ""} ${className}`}
      aria-label="Simploy home"
    >
      <Image
        src="/brand/simploy-logo.png"
        alt="Simploy"
        width={476}
        height={433}
        className={`block object-contain ${imageClassName}`}
      />
    </Link>
  );
}
