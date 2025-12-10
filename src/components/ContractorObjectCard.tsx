import React from "react";

interface ContractorObjectCardProps {
  name: string;
  address?: string;
  reportValue: string;
  hasTodayReport: boolean;
  onClick: () => void;
}

export function ContractorObjectCard({
  name,
  address,
  reportValue,
  hasTodayReport,
  onClick,
}: ContractorObjectCardProps) {
  const statusCopy = hasTodayReport ? "отчёт отправлен" : "нет отчёта";
  const statusTone = hasTodayReport ? "success" : "warning";

  return (
    <button type="button" onClick={onClick} className="contractor-card">
      <div className="contractor-card-header">
        <div className="space-y-[6px] text-left">
          <p className="contractor-card-title">{name}</p>
          {address ? <p className="contractor-card-address">{address}</p> : null}
        </div>

        <span className={`contractor-status-chip contractor-status-${statusTone}`}>
          <span className="contractor-status-dot" />
          {statusCopy}
        </span>
      </div>

      <div className="contractor-card-footer">
        <div className="flex items-center gap-[6px] text-left text-[13px]">
          <span className="contractor-report-label">Последний отчёт:</span>
          <span className="contractor-report-value">{reportValue}</span>
        </div>

        <div className="contractor-activity-dots" aria-hidden>
          {[...Array(5)].map((_, index) => (
            <span key={index} className="contractor-activity-dot" />
          ))}
        </div>
      </div>
    </button>
  );
}
