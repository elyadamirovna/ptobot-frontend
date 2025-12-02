import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { formatRu } from "@/lib/format";
import { ManagerObject, ManagerObjectStatus } from "@/types/objects";

export type FilterKey = "all" | ManagerObjectStatus;

interface DirectorDashboardProps {
  userName: string;
  objects: ManagerObject[];
  onOpenObject: (objectId: string) => void;
  onOpenFilters: () => void;
}

export function DirectorDashboard({
  userName,
  objects,
  onOpenObject,
  onOpenFilters,
}: DirectorDashboardProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const isLoadingDashboard = false;

  const filtered = useMemo(
    () => objects.filter((object) => (filter === "all" ? true : object.status === filter)),
    [filter, objects]
  );

  const stats = useMemo(
    () => ({
      total: objects.length,
      onTrack: objects.filter((o) => o.status === "onTrack").length,
      delayed: objects.filter((o) => o.status === "delayed").length,
    }),
    [objects]
  );

  return (
    <div className="space-y-5">
      <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">РБК Строй Инвест</p>
            <h2 className="text-2xl font-semibold sm:text-[26px]">Дэшборд руководителя</h2>
            <p className="text-sm text-white/75">Руководитель: {userName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[{ key: "all", label: "Все" }, { key: "onTrack", label: "В срок" }, { key: "delayed", label: "Отстают" }].map(
              (option) => (
                <Button
                  key={option.key}
                  variant="secondary"
                  size="sm"
                  className={`h-9 rounded-full px-3 text-[12px] font-semibold shadow-[0_10px_30px_rgba(6,17,44,0.3)] backdrop-blur ${
                    filter === option.key
                      ? "border-white/60 bg-white text-slate-900"
                      : "border-white/30 bg-white/15 text-white/85 hover:bg-white/25"
                  }`}
                  onClick={() => setFilter(option.key as FilterKey)}
                >
                  {option.label}
                </Button>
              )
            )}
            <Button
              variant="secondary"
              size="icon"
              className="ml-auto h-10 w-10 rounded-full border-white/30 bg-white/20 text-white/90 hover:bg-white/30"
              onClick={onOpenFilters}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-[13px] text-white/85">
            Объектов: {stats.total} • В срок: {stats.onTrack} • Отстают: {stats.delayed}
          </div>

          {isLoadingDashboard ? (
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center text-white/75">
              Загружаем дэшборд…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-8 text-center text-white/80">
              <div className="text-3xl">📊</div>
              <div className="text-lg font-semibold">Нет доступных объектов</div>
              <p className="text-[13px] text-white/70">Добавьте объекты в кабинете администратора.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((object) => (
                <Card
                  key={object.id}
                  className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/95 text-slate-900 shadow-[0_18px_48px_rgba(8,47,73,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(8,47,73,0.3)]"
                  onClick={() => onOpenObject(object.id)}
                >
                  <CardContent className="space-y-2 p-4 sm:p-5">
                    <div className="flex items-center justify-between text-[15px] font-semibold sm:text-[16px]">
                      <span>{object.name}</span>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          object.status === "onTrack"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {object.status === "onTrack" ? "в срок" : "отставание"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] text-slate-800">
                      <span>Готовность: {object.readinessPercent}%</span>
                      <span
                        className={`text-[12px] font-semibold ${
                          object.readinessDelta && object.readinessDelta !== 0
                            ? object.readinessDelta > 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                            : "text-slate-500"
                        }`}
                      >
                        {object.readinessDelta && object.readinessDelta !== 0
                          ? `${object.readinessDelta > 0 ? "+" : ""}${object.readinessDelta} % за период`
                          : "без изменений"}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-600 sm:text-[13px]">
                      Последний отчёт: {object.lastReportDate ? formatRu(object.lastReportDate) : "—"}
                      {object.foremanName && (
                        <span className="text-slate-500"> • Прораб: {object.foremanName}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
