import React from "react";
import { ContractorObject } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const gradientBackground =
  "min-h-screen bg-gradient-to-b from-[#0b1226] via-[#0f1a3c] to-[#122b5c] text-white";

const formatDate = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("ru-RU").format(new Date(iso)) : "";

const LastReportText: React.FC<{ lastReportDate?: string; hasTodayReport: boolean }> = ({
  lastReportDate,
  hasTodayReport,
}) => {
  if (hasTodayReport) {
    return <span>Последний отчёт: сегодня</span>;
  }

  if (lastReportDate) {
    return <span>Последний отчёт: {formatDate(lastReportDate)}</span>;
  }

  return <span>Отчётов пока нет</span>;
};

const StatusBadge: React.FC<{ hasTodayReport: boolean }> = ({ hasTodayReport }) => {
  const styles = hasTodayReport
    ? "bg-emerald-100 text-emerald-700"
    : "bg-orange-100 text-orange-700";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles}`}
    >
      {hasTodayReport ? "отчёт отправлен" : "нет отчёта"}
    </span>
  );
};

type ContractorHomeScreenProps = {
  userName: string;
  objects: ContractorObject[];
  loading?: boolean;
  onCreateReport: () => void;
  onOpenObject: (objectId: string) => void;
};

export const ContractorHomeScreen: React.FC<ContractorHomeScreenProps> = ({
  userName,
  objects,
  loading = false,
  onCreateReport,
  onOpenObject,
}) => {
  const paddingTopStyle = { paddingTop: "calc(var(--safe-area-top) + 20px)" } as const;
  const paddingBottomStyle = { paddingBottom: "calc(var(--safe-area-bottom) + 140px)" } as const;

  return (
    <div className={`${gradientBackground}`}>
      <div className="max-w-md mx-auto px-4" style={paddingTopStyle}>
        <header className="mb-6 space-y-1">
          <div className="text-xs uppercase tracking-[0.18em] text-sky-200">РБК Строй Инвест</div>
          <h1 className="text-2xl font-semibold">Добрый день, {userName}</h1>
          <p className="text-sky-100 text-sm">Объекты под вашим контролем</p>
        </header>
      </div>

      <main
        className="max-w-md mx-auto px-4 space-y-3"
        style={paddingBottomStyle}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-sky-200" />
            <p className="text-sky-100">Загружаем объекты…</p>
          </div>
        ) : objects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="text-4xl">🏗️</div>
            <div className="font-semibold text-lg">Пока нет назначенных объектов</div>
            <p className="text-sky-100 text-sm">
              Обратитесь к руководителю, чтобы вас добавили на объект.
            </p>
          </div>
        ) : (
          objects.map((object) => (
            <Card
              key={object.id}
              className="bg-white/95 text-slate-900 shadow-xl border-none cursor-pointer transition hover:-translate-y-0.5 hover:shadow-2xl"
              onClick={() => onOpenObject(object.id)}
            >
              <CardContent className="py-4">
                <div className="space-y-1.5">
                  <div className="text-base font-semibold leading-6">{object.name}</div>
                  {object.address ? (
                    <div className="text-sm text-slate-500">{object.address}</div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                    <LastReportText
                      lastReportDate={object.lastReportDate}
                      hasTodayReport={object.hasTodayReport}
                    />
                    <StatusBadge hasTodayReport={object.hasTodayReport} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      <div className="fixed left-0 right-0 bottom-0 z-20 bg-gradient-to-t from-[#0b1226] via-[#0c1733] to-transparent pt-4 pb-4" style={{ paddingBottom: "calc(var(--safe-area-bottom) + 16px)" }}>
        <div className="max-w-md mx-auto px-4">
          <Button
            onClick={onCreateReport}
            className="w-full h-14 text-base font-semibold bg-sky-500 hover:bg-sky-600"
          >
            Создать отчёт
          </Button>
        </div>
      </div>
    </div>
  );
};
