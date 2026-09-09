"use client";

import { useEffect } from "react";

export function MetricBeacon({
  articleId,
  metricType,
}: {
  articleId: string;
  metricType: "PAGE_VIEW" | "PDF_DOWNLOAD";
}) {
  useEffect(() => {
    void fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, metricType }),
    });
  }, [articleId, metricType]);
  return null;
}
