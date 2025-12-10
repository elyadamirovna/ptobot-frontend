import React from "react";
import StatusChip from "@/components/ui/StatusChip";
import "@/styles/home.css";

export interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  lastReport: string;
  status: "sent" | "missing";
  activity: number[];
  onClick?: () => void;
}

export default function PropertyCard({ name, address, lastReport, status, activity, onClick }: PropertyCardProps) {
  return (
    <button type="button" onClick={onClick} className="property-card">
      <div className="property-card-content">
        <div>
          <div className="property-name">{name}</div>
          <div className="property-address">{address}</div>
          <div className="last-report-label">последний отчёт:</div>
          <div className="last-report-date">{lastReport}</div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <StatusChip status={status} />
          <div className="flex items-center gap-2">
            {activity.map((dot, index) => (
              <span key={index} className={`activity-dot ${dot ? "activity-dot--active" : ""}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="glow-overlay" />
    </button>
  );
}
