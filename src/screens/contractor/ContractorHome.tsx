import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRu } from "@/lib/format";
import { ContractorObject } from "@/types/objects";

export interface ContractorHomeScreenProps {
  userName: string;
  objects: ContractorObject[];
  onCreateReport: () => void;
  onOpenObject: (objectId: string) => void;
}

export function ContractorHome({
  userName,
  objects,
  onCreateReport,
  onOpenObject,
}: ContractorHomeScreenProps) {
  const isLoading = false;
  const hasObjects = objects.length > 0;

  return (
    <div className="space-y-5">
      <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
              РБК Строй Инвест
            </p>
            <h1 className="text-2xl font-semibold text-white sm:text-[26px]">
              Добрый день, {userName}
            </h1>
            <p className="text-sm text-white/75">Объекты под вашим контролем</p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center text-white/75">
              Загружаем объекты…
            </div>
          ) : hasObjects ? (
            <div className="space-y-3">
              {objects.map((object) => (
                <Card
                  key={object.id}
                  className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/95 text-slate-900 shadow-[0_18px_48px_rgba(8,47,73,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(8,47,73,0.3)]"
                  onClick={() => onOpenObject(object.id)}
                >
                  <CardContent className="space-y-2 p-4 sm:p-5">
                    <div className="text-[15px] font-semibold sm:text-[16px]">
                      {object.name}
                    </div>
                    {object.address && (
                      <div className="text-[12px] text-slate-600 sm:text-[13px]">{object.address}</div>
                    )}
                    <div className="flex items-center justify-between text-[12px] sm:text-[13px]">
                      <span className="text-slate-700">
                        {object.hasTodayReport
                          ? "Последний отчёт: сегодня"
                          : object.lastReportDate
                            ? `Последний отчёт: ${formatRu(object.lastReportDate)}`
                            : "Отчётов пока нет"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          object.hasTodayReport
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {object.hasTodayReport ? "отчёт отправлен" : "нет отчёта"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-8 text-center text-white/80">
              <div className="text-3xl">🏗️</div>
              <div className="text-lg font-semibold">Пока нет назначенных объектов</div>
              <p className="text-[13px] text-white/70">
                Обратитесь к руководителю, чтобы вас добавили на объект.
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="button"
              className="h-14 w-full rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] text-base font-semibold text-sky-900 shadow-[0_18px_50px_rgba(3,144,255,0.9)] hover:brightness-110"
              onClick={onCreateReport}
            >
              Создать отчёт
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
