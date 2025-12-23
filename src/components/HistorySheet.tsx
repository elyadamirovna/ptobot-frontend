import React from "react";
import { HistoryRow, WorkType } from "@/types/app";
import { formatRu, toOneLine } from "@/utils/format";

interface HistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  objectName: string;
  reports: HistoryRow[];
  workTypes: WorkType[];
  onSelectReport: (reportId: number) => void;
}

export function HistorySheet({
  isOpen,
  onClose,
  objectName,
  reports,
  workTypes,
  onSelectReport,
}: HistorySheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Закрыть историю"
      />
      <div className="relative w-full max-w-[640px] rounded-t-[28px] border border-white/20 bg-[#07132F] px-5 pb-6 pt-5 text-white shadow-[0_30px_80px_rgba(6,17,44,0.6)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold">История отчётов</h3>
            <p className="text-[12px] text-white/70">{objectName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] text-white/80"
          >
            Закрыть
          </button>
        </div>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-[12px] text-white/70">
              Пока нет отчётов по этому объекту.
            </div>
          ) : (
            reports.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelectReport(item.id)}
                className="w-full rounded-[20px] border border-white/10 bg-white/5 p-4 text-left text-white/90 transition hover:bg-white/10"
              >
                <div className="flex flex-col gap-1 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:text-[12px]">
                  <span>{formatRu(item.date)}</span>
                  <span className="text-white/70">
                    {workTypes.find((type) => type.id === item.work_type_id)?.name ?? "Вид работ"}
                  </span>
                </div>
                <div className="mt-2 text-[12px] text-white/85 sm:text-[13px]">
                  {toOneLine(item.description)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
