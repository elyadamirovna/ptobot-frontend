import React from "react";

export type StatusChipStatus = "sent" | "missing";

interface StatusChipProps {
  status: StatusChipStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const label = status === "sent" ? "отчёт отправлен" : "нет отчёта";
  const intentClass = status === "sent" ? "ch-v1-chip--success" : "ch-v1-chip--warning";

  return (
    <span className={`ch-v1-chip ${intentClass}`}>
      <span className={`ch-v1-dot ${intentClass === "ch-v1-chip--success" ? "ch-v1-dot--active" : "ch-v1-dot--warning"}`} />
      {label}
    </span>
  );
}
