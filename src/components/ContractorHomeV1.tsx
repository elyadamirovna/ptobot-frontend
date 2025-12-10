import React from "react";
import { formatRu } from "@/utils/format";

export type ContractorObjectStatus = "sent" | "missing";

export interface ContractorObject {
  id: string;
  name: string;
  address?: string;
  lastReportDate?: string; // ISO string or "today"
  status: ContractorObjectStatus;
}

export interface ContractorHomeV1Props {
  userName: string;
  objects: ContractorObject[];
  onOpenObject: (id: string) => void;
}

function renderReportDate(value?: string) {
  if (!value) return "нет данных";
  if (value === "today") return "сегодня";
  return formatRu(value);
}

export function ContractorHomeV1({
  userName,
  objects,
  onOpenObject,
}: ContractorHomeV1Props) {
  return (
    <div className="v1-container variant-glassmorphism">
      <div className="v1-logo">
        <div className="v1-logo-icon" aria-hidden>
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="8" width="36" height="32" rx="8" fill="currentColor" opacity="0.16" />
            <path
              d="M16 18h16l-3 4h-6l-4 8-5-2 3-6Z"
              fill="currentColor"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>

      <section className="v1-greeting-section">
        <h1 className="v1-greeting">Добрый день, {userName}</h1>
        <p className="v1-subtitle">Объекты под вашим контролем</p>
      </section>

      <section className="v1-cards-container">
        {objects.map((object) => (
          <button
            key={object.id}
            type="button"
            className="v1-card"
            onClick={() => onOpenObject(object.id)}
          >
            <div className="v1-card-inner">
              <div className="v1-card-header">
                <div>
                  <div className="v1-card-title">{object.name}</div>
                  {object.address && (
                    <div className="v1-card-address">{object.address}</div>
                  )}
                </div>

                <div
                  className="v1-status-chip"
                  style={{
                    background:
                      object.status === "sent"
                        ? "rgba(16, 185, 129, 0.16)"
                        : "rgba(251, 191, 36, 0.16)",
                    color: object.status === "sent" ? "#6EE7B7" : "#FBBF24",
                  }}
                >
                  <span
                    className="v1-status-dot"
                    style={{
                      backgroundColor:
                        object.status === "sent" ? "#34D399" : "#F59E0B",
                    }}
                  />
                  {object.status === "sent" ? "отчёт отправлен" : "нет отчёта"}
                </div>
              </div>

              <div className="v1-card-footer">
                <div>
                  <div className="v1-report-label">последний отчёт</div>
                  <div className="v1-report-date">{renderReportDate(object.lastReportDate)}</div>
                </div>

                <div className="v1-activity-dots">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="v1-dot"
                      style={{ opacity: i === 4 ? 1 : 0.35 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
