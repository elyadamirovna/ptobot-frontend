import React from "react";
import { formatRu } from "@/utils/format";
import { StatusChip, StatusChipStatus } from "@/components/ui/StatusChip";

export interface ContractorObjectCardProps {
  id: string;
  name: string;
  address?: string;
  lastReportDate: string | "today";
  status: StatusChipStatus;
  onClick: () => void;
}

function renderLastReportDate(value: string | "today") {
  if (value === "today") return "сегодня";
  return formatRu(value);
}

export function ContractorObjectCard({
  name,
  address,
  lastReportDate,
  status,
  onClick,
}: ContractorObjectCardProps) {
  const isSent = status === "sent";

  return (
    <button type="button" className="ch-v1-card" onClick={onClick}>
      <div className="ch-v1-card__top">
        <div className="ch-v1-card__meta">
          <p className="ch-v1-card__label">Объект</p>
          <p className="ch-v1-card__title">{name}</p>
          {address ? <p className="ch-v1-card__address">{address}</p> : null}
        </div>
        <StatusChip status={status} />
      </div>

      <div className="ch-v1-card__footer">
        <div className="ch-v1-card__date">
          <span className="ch-v1-card__date-label">Последний отчёт</span>
          <span className="ch-v1-card__date-value">{renderLastReportDate(lastReportDate)}</span>
        </div>
        <div className="ch-v1-activity" aria-hidden>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`ch-v1-dot ${isSent ? "ch-v1-dot--active" : "ch-v1-dot--warning"} ${
                index === 2 ? "ch-v1-dot--muted" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
