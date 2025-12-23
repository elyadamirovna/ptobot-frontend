import React from "react";
import { formatRu } from "@/utils/format";
import { HeaderLogo } from "./HeaderLogo";

export interface ContractorObject {
  id: string;
  name: string;
  address?: string;
  lastReportDate?: string | "today";
  status: "sent" | "missing";
  hasTodayReport?: boolean;
}

export interface ContractorHomeScreenProps {
  userName: string;
  objects: ContractorObject[];
  onStartReport: (id: string) => void;
  onViewTodayReport: (id: string) => void;
  onOpenHistory: (id: string) => void;
  logoUrl?: string;
  logoLoaded?: boolean;
  logoReveal?: boolean;
  onLogoLoad?: () => void;
}

export function ContractorHomeScreen({
  userName,
  objects,
  onStartReport,
  onViewTodayReport,
  onOpenHistory,
  logoUrl,
  logoLoaded,
  logoReveal,
  onLogoLoad,
}: ContractorHomeScreenProps) {
  const activeCount = objects.length;
  const todayReports = objects.filter((object) =>
    object.hasTodayReport ?? object.lastReportDate === "today"
  ).length;

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[760px] flex-1 flex-col pt-1.5 text-white sm:pt-2">
      <div
        className="relative flex flex-1 flex-col border border-white/15 shadow-[0_18px_54px_rgba(6,17,44,0.38)]"
        style={{
          borderRadius: "24px",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(26px)",
          padding: "20px 18px",
        }}
      >
        <div className="flex flex-col gap-6 sm:gap-7">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <HeaderLogo
                logoUrl={logoUrl || ""}
                logoLoaded={Boolean(logoLoaded)}
                logoReveal={Boolean(logoReveal)}
                onLoad={onLogoLoad || (() => {})}
              />
            </div>

            <ContractorHero
              userName={userName}
              activeCount={activeCount}
              todayReports={todayReports}
            />
          </div>

          <div className="flex flex-col gap-[18px]">
            {objects.map((object, index) => (
              <ContractorObjectCard
                key={object.id}
                object={object}
                accentIndex={index}
                onStartReport={() => onStartReport(object.id)}
                onViewTodayReport={() => onViewTodayReport(object.id)}
                onOpenHistory={() => onOpenHistory(object.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractorHero({
  userName: _userName,
  activeCount,
  todayReports,
}: {
  userName: string;
  activeCount: number;
  todayReports: number;
}) {
  return (
    <div className="contractor-hero">
      <div className="contractor-hero-title">Добрый день, Никита</div>

      <div className="contractor-hero-divider" />

      <div className="contractor-hero-metrics">
        <div className="contractor-hero-metric">
          <div className="contractor-hero-metric-value">{activeCount}</div>
          <div className="contractor-hero-metric-label">Активные объекты</div>
        </div>

        <div className="contractor-hero-metric-divider" aria-hidden />

        <div className="contractor-hero-metric">
          <div className="contractor-hero-metric-value">{todayReports}</div>
          <div className="contractor-hero-metric-label">Отчётов за сегодня</div>
        </div>
      </div>
    </div>
  );
}

function ContractorObjectCard({
  object,
  onStartReport,
  onViewTodayReport,
  onOpenHistory,
  accentIndex,
}: {
  object: ContractorObject;
  onStartReport: () => void;
  onViewTodayReport: () => void;
  onOpenHistory: () => void;
  accentIndex: number;
}) {
  const isSentToday = object.hasTodayReport ?? object.lastReportDate === "today";
  const lastDateLabel = isSentToday
    ? "сегодня"
    : object.lastReportDate
      ? formatRu(object.lastReportDate)
      : "—";

  return (
    <div className="contractor-card">
      <div className="contractor-card-inner">
        <div className="contractor-card-header">
          <div className="contractor-card-text">
            <p className="contractor-card-title">{object.name}</p>
            {object.address ? (
              <p className="contractor-card-address">{object.address}</p>
            ) : null}
            <p className="contractor-card-today-status">
              {isSentToday ? "Сегодня: отчёт есть" : "Сегодня: отчёта нет"}
            </p>
          </div>

          <span
            className={`contractor-status-chip ${
              isSentToday ? "contractor-status-chip--ok" : "contractor-status-chip--missing"
            }`}
          >
            {isSentToday ? "отчёт отправлен" : "нет отчёта"}
          </span>
        </div>

        <div className="contractor-card-footer">
          <div className="contractor-report">
            <p className="contractor-report-label">Последний отчёт:</p>
            <p className="contractor-report-value">{lastDateLabel}</p>
          </div>

          <div
            className={`contractor-activity-dots ${
              isSentToday ? "is-ok" : "is-missing"
            }`}
            aria-hidden
          >
            {Array.from({ length: 5 }).map((_, idx) => (
              <span
                key={idx}
                className={`contractor-activity-dot ${idx === (accentIndex % 5) ? "is-active" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="contractor-card-actions">
          <button
            type="button"
            onClick={isSentToday ? onViewTodayReport : onStartReport}
            className="contractor-card-primary"
          >
            {isSentToday ? "👁 Посмотреть" : "➕ Заполнить отчёт"}
          </button>
          <button type="button" onClick={onOpenHistory} className="contractor-card-secondary">
            📜 История
          </button>
        </div>
      </div>
    </div>
  );
}
