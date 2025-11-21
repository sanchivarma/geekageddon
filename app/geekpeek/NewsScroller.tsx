"use client";

import { ReactNode } from "react";

type NewsScrollerProps = {
  children: ReactNode;
};

export function NewsScroller({ children }: NewsScrollerProps) {
  return (
    <div className="snap-y snap-mandatory h-[70vh] overflow-y-auto space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-2 text-sm shadow-inner dark:border-slate-800/70 dark:bg-slate-900/40">
      {children}
    </div>
  );
}
