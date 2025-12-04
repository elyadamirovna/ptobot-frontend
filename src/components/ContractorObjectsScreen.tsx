import React from "react";
import { Button } from "@/components/ui/button";
import { HeaderLogo } from "./HeaderLogo";
import { formatRu } from "@/utils/format";

export type ContractorObjectStatus = "sent" | "missing";

export interface ContractorObjectCard {
  id: string;
  name: string;
  address: string;
  lastReportDate: string; // "today" или ISO
  status: ContractorObjectStatus;
}

export interface ContractorObjectsScreenProps {
  contractorName: string;
  logoUrl: string;
  logoLoaded: boolean;
  logoReveal: boolean;
  objects: ContractorObjectCard[];
  onOpenObject: (objectId: string) => void;
  onCreateReport: () => void;
  onLogoLoad: () => void;
}

function renderLastReportDate(value: string) {
  return value === "today" ? "сегодня" : formatRu(value);
}

export function ContractorObjectsScreen({
  contractorName,
  logoUrl,
  logoLoaded,
  logoReveal,
  objects,
  onOpenObject,
  onCreateReport,
  onLogoLoad,
}: ContractorObjectsScreenProps) {
  return (
    <div className="relative mx-auto w-[92%] max-w-[780px]">
      <div className="pointer-events-none absolute -left-10 -top-14 h-32 w-32 rounded-full bg-sky-300/25 blur-[110px]" />
      <div className="pointer-events-none absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-emerald-300/25 blur-[110px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-20 w-40 -translate-x-1/2 rounded-full bg-white/15 blur-[100px]" />
      <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 px-5 py-6 text-white shadow-[0_24px_70px_rgba(6,17,44,0.55)] backdrop-blur-[28px] sm:px-7 sm:py-8">
        <div className="glass-grid-overlay" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <HeaderLogo
                logoUrl={logoUrl}
                logoLoaded={logoLoaded}
                logoReveal={logoReveal}
                onLoad={onLogoLoad}
              />
              <div>
                <p className="text-[13px] font-semibold text-white">Добрый день, {contractorName}</p>
                <p className="text-[12px] text-white/75">Объекты под вашим контролем</p>
              </div>
            </div>
            <div className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
              Подрядчик
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {objects.map((object) => (
              <button
                key={object.id}
                onClick={() => onOpenObject(object.id)}
                className="group flex w-full flex-col gap-2 rounded-[24px] border border-white/35 bg-white/60 px-4 py-4 text-left text-slate-900 shadow-[0_16px_50px_rgba(6,17,44,0.35)] backdrop-blur transition hover:-translate-y-[2px] hover:shadow-[0_24px_60px_rgba(6,17,44,0.45)] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Название</p>
                  <p className="text-[18px] font-semibold text-slate-900">{object.name}</p>
                  <p className="text-[12px] text-slate-600">Адрес: {object.address}</p>
                  <p className="text-[12px] text-slate-600">
                    Последний отчёт: <span className="font-semibold text-slate-800">{renderLastReportDate(object.lastReportDate)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[12px] font-semibold shadow-[0_12px_30px_rgba(6,17,44,0.15)] sm:self-center">
                  <span className={`h-2 w-2 rounded-full ${object.status === "sent" ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <span className={object.status === "sent" ? "text-emerald-700" : "text-amber-700"}>
                    {object.status === "sent" ? "отчёт отправлен" : "нет отчёта"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-1">
            <Button
              className="w-full rounded-full bg-gradient-to-r from-[#48C6EF] via-[#52E5FF] to-[#84FAB0] py-3 text-[13px] font-semibold text-sky-950 shadow-[0_24px_70px_rgba(6,17,44,0.55)] transition hover:brightness-110"
              onClick={onCreateReport}
            >
              Создать отчёт
            </Button>
            <p className="mt-2 text-center text-[11px] text-white/75">Тап по карточке → Экран 3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
