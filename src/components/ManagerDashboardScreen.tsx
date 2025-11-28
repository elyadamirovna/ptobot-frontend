import React, { useMemo, useState } from "react";
import { ManagerObject } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Loader2 } from "lucide-react";

const gradientBackground =
  "min-h-screen bg-gradient-to-b from-[#0b1226] via-[#0f1a3c] to-[#122b5c] text-white";

const formatDate = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("ru-RU").format(new Date(iso)) : "—";

const StatusBadge: React.FC<{ status: ManagerObject["status"] }> = ({ status }) => {
  const styles =
    status === "onTrack"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles}`}>
      {status === "onTrack" ? "в срок" : "отставание"}
    </span>
  );
};

type ManagerDashboardScreenProps = {
  objects: ManagerObject[];
  loading?: boolean;
  onOpenObject: (objectId: string) => void;
  onOpenFilters: () => void;
};

export const ManagerDashboardScreen: React.FC<ManagerDashboardScreenProps> = ({
  objects,
  loading = false,
  onOpenObject,
  onOpenFilters,
}) => {
  const [filter, setFilter] = useState<"all" | ManagerObject["status"]>("all");
  const paddingTopStyle = { paddingTop: "calc(var(--safe-area-top) + 20px)" } as const;
  const paddingBottomStyle = { paddingBottom: "calc(var(--safe-area-bottom) + 40px)" } as const;

  const filteredObjects = useMemo(() => {
    if (filter === "all") return objects;
    return objects.filter((item) => item.status === filter);
  }, [filter, objects]);

  const summary = useMemo(() => {
    const total = objects.length;
    const onTrack = objects.filter((item) => item.status === "onTrack").length;
    const delayed = objects.filter((item) => item.status === "delayed").length;
    return { total, onTrack, delayed };
  }, [objects]);

  return (
    <div className={gradientBackground}>
      <div className="max-w-md mx-auto px-4" style={paddingTopStyle}>
        <header className="mb-6 space-y-1">
          <div className="text-xs uppercase tracking-[0.18em] text-sky-200">РБК Строй Инвест</div>
          <h1 className="text-2xl font-semibold">Дэшборд руководителя</h1>
          <p className="text-sky-100 text-sm">Сводка по объектам и отчётам</p>
        </header>

        <div className="flex items-center gap-2 mb-4">
          {(
            [
              { key: "all" as const, label: "Все" },
              { key: "onTrack" as const, label: "В срок" },
              { key: "delayed" as const, label: "Отстают" },
            ]
          ).map((chip) => (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key)}
              className={`glass-chip px-3 py-2 text-sm font-medium transition border border-white/20 shadow-lg flex-1 min-w-0 ${
                filter === chip.key
                  ? "text-white bg-white/15"
                  : "text-sky-100 hover:bg-white/10"
              }`}
            >
              {chip.label}
            </button>
          ))}
          <Button
            variant="secondary"
            size="icon"
            onClick={onOpenFilters}
            className="h-11 w-11 rounded-xl bg-white/15 border border-white/20 text-white hover:bg-white/25"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-sky-100 text-sm mb-4">
          Объектов: {summary.total} • В срок: {summary.onTrack} • Отстают: {summary.delayed}
        </div>
      </div>

      <main
        className="max-w-md mx-auto px-4 space-y-3"
        style={paddingBottomStyle}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-sky-200" />
            <p className="text-sky-100">Загружаем дэшборд…</p>
          </div>
        ) : filteredObjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="text-4xl">📊</div>
            <div className="font-semibold text-lg">Нет доступных объектов</div>
            <p className="text-sky-100 text-sm">Добавьте объекты в кабинете администратора.</p>
          </div>
        ) : (
          filteredObjects.map((object) => (
            <Card
              key={object.id}
              className="bg-white/95 text-slate-900 shadow-xl border-none cursor-pointer transition hover:-translate-y-0.5 hover:shadow-2xl"
              onClick={() => onOpenObject(object.id)}
            >
              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold leading-6">{object.name}</div>
                    <StatusBadge status={object.status} />
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <div>Готовность: {object.readinessPercent}%</div>
                    <div
                      className={`text-sm font-semibold ${
                        (object.readinessDelta ?? 0) >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {object.readinessDelta != null
                        ? `${object.readinessDelta > 0 ? "+" : ""}${object.readinessDelta}% за месяц`
                        : "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div>Последний отчёт: {formatDate(object.lastReportDate)}</div>
                    <div className="text-xs text-slate-500">
                      Прораб: {object.foremanName ?? "—"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};
