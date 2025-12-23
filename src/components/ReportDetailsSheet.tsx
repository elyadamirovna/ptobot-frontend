import React from "react";
import { HistoryRow, WorkType } from "@/types/app";
import { formatRu } from "@/utils/format";

interface ReportDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  report: HistoryRow | null;
  objectName: string;
  workTypes: WorkType[];
}

export function ReportDetailsSheet({
  isOpen,
  onClose,
  report,
  objectName,
  workTypes,
}: ReportDetailsSheetProps) {
  if (!isOpen || !report) return null;

  const workTypeName =
    workTypes.find((type) => type.id === report.work_type_id)?.name ?? "Вид работ";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Закрыть отчёт"
      />
      <div className="relative w-full max-w-[640px] rounded-t-[28px] border border-white/20 bg-[#07132F] px-5 pb-6 pt-5 text-white shadow-[0_30px_80px_rgba(6,17,44,0.6)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold">Отчёт</h3>
            <p className="text-[12px] text-white/70">
              {objectName} · {formatRu(report.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] text-white/80"
          >
            Закрыть
          </button>
        </div>

        <div className="space-y-3 text-[12px] text-white/85">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Вид работ</p>
            <p className="mt-1 text-[13px] font-semibold text-white">{workTypeName}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Объём</p>
              <p className="mt-1 text-[13px] font-semibold text-white">
                {report.volume ? `${report.volume} м³` : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Люди</p>
              <p className="mt-1 text-[13px] font-semibold text-white">
                {report.people ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Техника</p>
              <p className="mt-1 text-[13px] font-semibold text-white">
                {report.machines ?? 0}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Комментарий</p>
            <p className="mt-1 text-[13px] text-white">
              {report.comment || "—"}
            </p>
          </div>
        </div>

        {report.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {report.photos.map((photo, index) => (
              <img
                key={`${report.id}-${index}`}
                src={photo}
                alt="Фото отчёта"
                className="h-20 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
