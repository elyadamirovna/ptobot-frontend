import { FC } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type {
  ManagerFilter,
  ManagerObject,
  ManagerObjectStatus,
} from "@/types/objects";

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU");
};

type ManagerDashboardScreenProps = {
  objects: ManagerObject[];
  isLoading?: boolean;
  activeFilter: ManagerFilter;
  onFilterChange: (filter: ManagerFilter) => void;
  onOpenFilters: () => void;
  onOpenObject: (objectId: string) => void;
};

const statusBadgeClass = (status: ManagerObjectStatus) =>
  status === "onTrack"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-rose-100 text-rose-800";

export const ManagerDashboardScreen: FC<ManagerDashboardScreenProps> = ({
  objects,
  isLoading,
  activeFilter,
  onFilterChange,
  onOpenFilters,
  onOpenObject,
}) => {
  const filteredObjects = objects.filter((object) =>
    activeFilter === "all" ? true : object.status === activeFilter
  );

  const totals = objects.reduce(
    (acc, item) => {
      if (item.status === "onTrack") acc.onTrack += 1;
      if (item.status === "delayed") acc.delayed += 1;
      return acc;
    },
    { total: objects.length, onTrack: 0, delayed: 0 }
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a1430] via-[#0d1838] to-[#0f2149] text-slate-50">
      <div className="safe-area-page mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pb-10">
        <header className="flex flex-col gap-1 text-left">
          <span className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
            РБК Строй Инвест
          </span>
          <h1 className="text-2xl font-semibold sm:text-3xl">Дэшборд руководителя</h1>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl bg-white/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-cyan-100/90">
              Объекты
            </div>
            <button
              type="button"
              onClick={onOpenFilters}
              className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20"
              aria-label="Открыть фильтры"
            >
              <SlidersHorizontal className="size-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
            {["all", "onTrack", "delayed"].map((filter) => {
              const isActive = filter === activeFilter;
              const label =
                filter === "all"
                  ? "Все"
                  : filter === "onTrack"
                  ? "В срок"
                  : "Отстают";
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => onFilterChange(filter as ManagerFilter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-200/80">
            Объектов: {totals.total} • В срок: {totals.onTrack} • Отстают: {totals.delayed}
          </div>
        </div>

        <main className="flex flex-1 flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 p-8 text-sm text-slate-200">
              <Loader2 className="size-7 animate-spin text-cyan-300" />
              <span>Загружаем дэшборд…</span>
            </div>
          ) : filteredObjects.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-white/5 p-8 text-center text-slate-200">
              <div className="text-3xl">📊</div>
              <div className="text-lg font-semibold">Нет доступных объектов</div>
              <p className="text-sm text-slate-300/80">
                Добавьте объекты в кабинете администратора.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredObjects.map((object) => (
                <button
                  key={object.id}
                  type="button"
                  onClick={() => onOpenObject(object.id)}
                  className="text-left"
                >
                  <Card className="w-full rounded-2xl border-none bg-white text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-base font-semibold leading-snug">{object.name}</div>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${statusBadgeClass(object.status)}`}
                        >
                          {object.status === "onTrack" ? "в срок" : "отставание"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Готовность: {object.readinessPercent} %</span>
                        {typeof object.readinessDelta === "number" && (
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-semibold ${
                              object.readinessDelta >= 0
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {object.readinessDelta >= 0 ? (
                              <ArrowUpRight className="size-4" />
                            ) : (
                              <ArrowDownRight className="size-4" />
                            )}
                            {object.readinessDelta > 0 ? `+${object.readinessDelta} %` : `${object.readinessDelta} %`}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        {object.lastReportDate && (
                          <span>Последний отчёт: {formatDate(object.lastReportDate)}</span>
                        )}
                        {object.foremanName && (
                          <span className="text-slate-500">Прораб: {object.foremanName}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
