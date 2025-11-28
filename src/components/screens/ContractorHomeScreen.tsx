import { FC } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ContractorObject } from "@/types/objects";

type ContractorHomeScreenProps = {
  userName: string;
  objects: ContractorObject[];
  isLoading?: boolean;
  onCreateReport: () => void;
  onOpenObject: (objectId: string) => void;
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU");
};

export const ContractorHomeScreen: FC<ContractorHomeScreenProps> = ({
  userName,
  objects,
  isLoading,
  onCreateReport,
  onOpenObject,
}) => {
  const renderLastReport = (object: ContractorObject) => {
    if (object.hasTodayReport) return "Последний отчёт: сегодня";
    if (object.lastReportDate)
      return `Последний отчёт: ${formatDate(object.lastReportDate)}`;
    return "Отчётов пока нет";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a1430] via-[#0d1838] to-[#0f2149] text-slate-50">
      <div className="safe-area-page mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pb-28">
        <header className="flex flex-col gap-1 text-left">
          <span className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
            РБК Строй Инвест
          </span>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Добрый день, {userName}
          </h1>
          <p className="text-sm text-slate-200/80">
            Объекты под вашим контролем
          </p>
        </header>

        <main className="flex flex-1 flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 p-8 text-sm text-slate-200">
              <Loader2 className="size-7 animate-spin text-cyan-300" />
              <span>Загружаем объекты…</span>
            </div>
          ) : objects.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 p-8 text-center text-slate-200">
              <div className="text-3xl">🏗️</div>
              <div className="text-lg font-semibold">Пока нет назначенных объектов</div>
              <p className="text-sm text-slate-300/80">
                Обратитесь к руководителю, чтобы вас добавили на объект.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {objects.map((object) => {
                const statusBadge = object.hasTodayReport
                  ? {
                      text: "отчёт отправлен",
                      className: "bg-emerald-100 text-emerald-800",
                    }
                  : { text: "нет отчёта", className: "bg-amber-100 text-amber-800" };

                return (
                  <button
                    key={object.id}
                    type="button"
                    onClick={() => onOpenObject(object.id)}
                    className="text-left"
                  >
                    <Card className="w-full rounded-2xl border-none bg-white text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl">
                      <CardContent className="space-y-2 p-4">
                        <div className="text-base font-semibold leading-snug">
                          {object.name}
                        </div>
                        {object.address && (
                          <div className="text-sm text-slate-500">{object.address}</div>
                        )}
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            {object.hasTodayReport ? (
                              <CheckCircle2 className="size-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="size-4 text-amber-500" />
                            )}
                            <span>{renderLastReport(object)}</span>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${statusBadge.className}`}
                          >
                            {statusBadge.text}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0f2149] via-[#0f2149]/95 to-transparent">
        <div className="mx-auto w-full max-w-xl px-4 pb-[calc(1.25rem+var(--safe-area-bottom))] pt-3">
          <Button
            onClick={onCreateReport}
            className="h-14 w-full rounded-xl bg-cyan-600 text-base font-semibold text-white shadow-lg shadow-cyan-500/40 hover:bg-cyan-500"
          >
            Создать отчёт
          </Button>
        </div>
      </div>
    </div>
  );
};
