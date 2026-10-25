"use client";

import { useEffect, useState } from "react";
import type { RecentAttempt } from "./home-constants";

// ------------------------------------------------------------------
// آمار جهانی یادگیرندگان (/api/stats) — G-3: لغو fetch هنگام unmount
// به‌جای setState روی کامپوننت مُرده. یک‌بار در mount خوانده می‌شود.
// ------------------------------------------------------------------

export interface GlobalStats {
  total: number;
  avgPercent: number;
  last24h: number;
  recent: RecentAttempt[];
}

export function useGlobalStats(): GlobalStats | null {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/stats", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) =>
        setGlobalStats({
          total: d.total ?? 0,
          avgPercent: d.avgPercent ?? 0,
          last24h: d.last24h ?? 0,
          recent: Array.isArray(d.recent) ? d.recent : [],
        })
      )
      .catch(() => {});
    return () => ac.abort();
  }, []);
  return globalStats;
}
