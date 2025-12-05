import React from "react";
import { formatRu } from "@/utils/format";

type ObjectStatus = "sent" | "missing";

export interface ObjectCardProps {
  id: string;
  name: string;
  address?: string;
  lastReportDate: string | "today";
  status: ObjectStatus;
  onClick: () => void;
}

function renderLastReportDate(value: string | "today") {
  if (value === "today") return "сегодня";
  return formatRu(value);
}

export function ObjectCard({ name, address, lastReportDate, status, onClick }: ObjectCardProps) {
  const statusCopy = status === "sent" ? "отчёт отправлен" : "нет отчёта";
  const statusColor = status === "sent" ? "bg-emerald-400" : "bg-amber-400";
  const statusTextColor = status === "sent" ? "text-emerald-700" : "text-amber-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left transition hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(6,17,44,0.28)]"
      style={{
        borderRadius: "20px",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(22px)",
        padding: "16px 18px",
        boxShadow: "0 14px 36px rgba(6,17,44,0.25)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-[10px] text-slate-900">
          <div className="space-y-[6px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Название</p>
            <p className="text-[17px] font-semibold leading-[1.3]">{name}</p>
          </div>

          {address ? <p className="text-[13px] text-slate-600">{address}</p> : null}

          <p className="text-[13px] text-slate-700">
            Последний отчёт: <span className="font-semibold text-slate-900">{renderLastReportDate(lastReportDate)}</span>
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-[6px] self-start rounded-full px-[10px] py-1 text-[12px] font-semibold ${statusTextColor}`}
          style={{ background: "rgba(255,255,255,0.85)" }}
        >
          <span className={`h-[9px] w-[9px] rounded-full ${statusColor}`} />
          {statusCopy}
        </span>
      </div>
    </button>
  );
}
