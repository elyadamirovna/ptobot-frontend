import React from "react";
import { Button } from "@/components/ui/button";
import { ContractorObjectCard } from "./ContractorObjectCard";
import { formatRu } from "@/utils/format";

export interface ContractorObject {
  id: string;
  name: string;
  address?: string;
  lastReportDate?: string | "today";
  hasTodayReport?: boolean;
  status?: "sent" | "missing";
}

export interface ContractorHomeScreenProps {
  userName: string;
  objects: ContractorObject[];
  onOpenObject: (id: string) => void;
  onCreateReport: () => void;
  logoUrl?: string;
  logoLoaded?: boolean;
  logoReveal?: boolean;
  onLogoLoad?: () => void;
  activeTab?: "objects" | "reports";
  onTabChange?: (tab: "objects" | "reports") => void;
}

export function ContractorHomeScreen({
  userName,
  objects,
  onOpenObject,
  onCreateReport,
  activeTab = "objects",
  onTabChange,
}: ContractorHomeScreenProps) {
  const renderReportValue = (object: ContractorObject) => {
    if (object.hasTodayReport || object.lastReportDate === "today") {
      return "сегодня";
    }

    if (object.lastReportDate) {
      return formatRu(object.lastReportDate);
    }

    return "—";
  };

  return (
    <div className="relative mx-auto w-full max-w-[760px] text-white">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[26px] font-semibold leading-[1.2] sm:text-[28px]">
              Добрый день, {userName}
            </p>
            <p className="text-[14px] text-white/75 sm:text-[15px]">
              Объекты под вашим контролем
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 text-[12px] font-semibold shadow-[0_10px_24px_rgba(6,17,44,0.3)] backdrop-blur">
            {[
              { key: "objects", label: "Мои объекты" },
              { key: "reports", label: "Отчёты и доступ" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange?.(tab.key as "objects" | "reports")}
                  className={`min-w-[120px] rounded-full px-4 py-2 transition ${
                    isActive
                      ? "bg-white/85 text-slate-900 shadow-[0_12px_28px_rgba(255,255,255,0.35)]"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          className="w-full rounded-2xl bg-gradient-to-r from-[#48C6EF] via-[#52E5FF] to-[#84FAB0] px-4 py-3 text-[14px] font-semibold text-sky-950 shadow-[0_20px_60px_rgba(6,17,44,0.45)] transition hover:brightness-110"
          onClick={onCreateReport}
        >
          Создать отчёт
        </Button>

        <div className="flex flex-col gap-4">
          {objects.map((object) => (
            <ContractorObjectCard
              key={object.id}
              name={object.name}
              address={object.address}
              hasTodayReport={Boolean(
                object.hasTodayReport || object.lastReportDate === "today"
              )}
              reportValue={renderReportValue(object)}
              onClick={() => onOpenObject(object.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
