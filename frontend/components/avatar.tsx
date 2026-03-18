"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

function normalizeAvatarUrl(url?: string | null) {
  if (!url) return null;
  if (url.includes("api.dicebear.com") && url.includes("/svg?")) {
    return url.replace("/svg?", "/png?");
  }
  return url;
}

export function Avatar({
  src,
  alt,
  initial,
  className
}: {
  src?: string | null;
  alt: string;
  initial: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const normalizedSrc = normalizeAvatarUrl(src);

  if (!normalizedSrc || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border border-emerald-100 bg-gradient-to-br from-emerald-100 to-cyan-50 font-bold text-brand-text",
          className
        )}
      >
        {initial}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden border border-emerald-100 bg-white", className)}>
      <img
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
        src={normalizedSrc}
      />
    </div>
  );
}
