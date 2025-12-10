import React from "react";
import "@/styles/home.css";

type Status = "sent" | "missing";

interface StatusChipProps {
  status: Status;
}

export default function StatusChip({ status }: StatusChipProps) {
  const label = status === "sent" ? "отправлен" : "нет отчёта";
  const toneClass = status === "sent" ? "status-chip--sent" : "status-chip--missing";

  return <span className={`status-chip ${toneClass}`}>{label}</span>;
}
