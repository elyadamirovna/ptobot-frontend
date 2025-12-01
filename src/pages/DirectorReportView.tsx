import React, { useCallback, useMemo, useState } from "react";
import { ArrowLeft, CalendarIcon, Image as ImageIcon, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DirectorReportViewProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
}

type ViewMode = "summary" | "list";

type Report = {
  id: string;
  date: string;
  shift: "day" | "night";
  readinessPercent: number;
  description: string;
  photos: string[];
};

function formatRu(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function toOneLine(desc: string) {
  const source = String(desc || "");
  const vol = source.match(/Объём:\s*([^\n]+)/i)?.[1]?.trim();
  const mach = source.match(/Техника:\s*([^\n]+)/i)?.[1]?.trim();
  const ppl = source.match(/Люди:\s*([^\n]+)/i)?.[1]?.trim();
  const parts: string[] = [];
  if (vol) parts.push(`Объём: ${vol}`);
  if (mach) parts.push(`Техника: ${mach}`);
  if (ppl) parts.push(`Люди: ${ppl}`);
  return parts.length ? parts.join(" • ") : source.replace(/\s+/g, " ").trim();
}

export function DirectorReportView({ onNavigate, onBack }: DirectorReportViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  void onNavigate;

  const reports = useMemo<Report[]>(
    () => [
      {
        id: "1",
        date: "2025-11-24",
        shift: "day",
        readinessPercent: 75,
        description: "Объём: 12,5 м³\nТехника: 3\nЛюди: 15",
        photos: [
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=60",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=60",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=60",
        ],
      },
      {
        id: "2",
        date: "2025-11-23",
        shift: "night",
        readinessPercent: 72,
        description: "Объём: 10 м³\nТехника: 2\nЛюди: 9",
        photos: [
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=60",
        ],
      },
      {
        id: "3",
        date: "2025-11-22",
        shift: "day",
        readinessPercent: 70,
        description: "Объём: 8,5 м³\nТехника: 3\nЛюди: 7",
        photos: [],
      },
    ],
    []
  );

  const latestReport = reports[0];
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    window.history.back();
  }, [onBack]);

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden text-white"
      style={{
        backgroundColor: "var(--app-surface)",
        backgroundImage: "var(--app-surface-gradient)",
      }}
    >
      <div className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-indigo-500/40 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-120px] h-[420px] w-[420px] rounded-full bg-sky-400/35 blur-[160px]" />
      <div className="pointer-events-none absolute inset-x-1/2 top-[40%] h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-[120px]" />

      <main
        className="safe-area-page relative z-10 flex min-h-[100dvh] w-full flex-1 justify-center overflow-y-auto px-3 pb-16 pt-8 touch-pan-y md:px-4"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorY: "contain" }}
      >
        <div className="mx-auto w-full max-w-full md:max-w-[620px] lg:max-w-[700px]">
          <div className="relative rounded-[32px] px-1 pb-10 sm:rounded-[44px] sm:px-2 sm:pb-12 lg:rounded-[52px] lg:px-3 lg:pb-14">
            <div className="glass-grid-overlay" />
            <div className="relative space-y-5">
              <header className="flex items-center justify-between gap-3 rounded-3xl bg-white/10 px-4 py-3 backdrop-blur-md">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">РУКОВОДИТЕЛЬ</p>
                  <h1 className="text-2xl font-semibold text-white sm:text-[28px]">ЖК «Северный»</h1>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="h-11 rounded-full border-none bg-white/85 px-4 text-sm font-semibold text-sky-900 shadow-[0_12px_32px_rgba(3,144,255,0.45)] hover:brightness-110"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
              </header>

              {viewMode === "summary" && latestReport && (
                <>
                  <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
                    <CardHeader className="pb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Сводка</p>
                      <CardTitle className="text-xl font-semibold text-white">Сводка по объекту</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-6">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[32px] font-semibold leading-none">Готовность объекта: 75 %</p>
                          <p className="mt-1 text-sm text-emerald-100">+12 % за месяц</p>
                        </div>
                        <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">Обновлено</div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-300/90 via-indigo-300/80 to-emerald-300/90"
                          style={{ width: "75%" }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
                    <CardHeader className="pb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Сегодняшний отчёт</p>
                      <CardTitle className="text-xl font-semibold text-white">{formatRu(latestReport.date)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6 text-sm text-white/90">
                      <div className="flex items-center gap-3 text-base font-semibold text-white">
                        <Users className="h-4 w-4 text-white/80" /> Прораб: Иванов И.
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white/5 px-3 py-2 text-[13px] font-semibold leading-tight text-white">
                          Бетон: 12,5 м³
                        </div>
                        <div className="rounded-2xl bg-white/5 px-3 py-2 text-[13px] font-semibold leading-tight text-white">
                          Кладка: 40 м²
                        </div>
                        <div className="rounded-2xl bg-white/5 px-3 py-2 text-[13px] font-semibold leading-tight text-white">
                          Рабочие: 15 • Техника: 3
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Фото</p>
                        <div className="grid grid-cols-3 gap-3">
                          {latestReport.photos.slice(0, 3).map((photo) => (
                            <div
                              key={photo}
                              className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                            >
                              <img
                                src={photo}
                                alt="Предпросмотр"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    className="mt-1 h-11 w-full rounded-full bg-white text-[13px] font-semibold text-sky-900 shadow-[0_14px_30px_rgba(255,255,255,0.25)]"
                    onClick={() => setViewMode("list")}
                  >
                    Смотреть все отчёты по объекту
                  </Button>
                </>
              )}

              {viewMode === "list" && (
                <div className="space-y-4">
                  <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
                    <CardHeader className="pb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Фильтры</p>
                      <CardTitle className="text-xl font-semibold text-white">Параметры отчётов</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">С даты</label>
                          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3">
                            <CalendarIcon className="h-4 w-4 text-white/70" />
                            <Input type="date" className="h-11 border-none bg-transparent text-sm text-white focus-visible:ring-0" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">По дату</label>
                          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3">
                            <CalendarIcon className="h-4 w-4 text-white/70" />
                            <Input type="date" className="h-11 border-none bg-transparent text-sm text-white focus-visible:ring-0" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Вид работ</label>
                          <Select>
                            <SelectTrigger className="h-11 rounded-2xl border-white/15 bg-white/5 text-sm font-semibold text-white">
                              <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="all">Все</SelectItem>
                              <SelectItem value="Бетон">Бетон</SelectItem>
                              <SelectItem value="Кладка">Кладка</SelectItem>
                              <SelectItem value="Отделка">Отделка</SelectItem>
                              <SelectItem value="Инженерия">Инженерия</SelectItem>
                              <SelectItem value="Другое">Другое</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Прораб</label>
                          <Select>
                            <SelectTrigger className="h-11 rounded-2xl border-white/15 bg-white/5 text-sm font-semibold text-white">
                              <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="all">Все</SelectItem>
                              <SelectItem value="ivanov">Иванов</SelectItem>
                              <SelectItem value="petrov">Петров</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="px-1 text-sm text-white/80">
                    Всего отчётов: {reports.length} за выбранный период
                  </div>

                  <div className="space-y-3">
                    {reports.map((report) => (
                      <Card
                        key={report.id}
                        className="glass-panel border-white/20 bg-gradient-to-br from-white/12 via-white/8 to-white/5 text-white shadow-[0_20px_60px_rgba(6,17,44,0.5)] backdrop-blur-2xl"
                      >
                        <CardContent className="space-y-3 pb-5 pt-5">
                          <div className="flex items-center justify-between text-sm font-semibold text-white">
                            <span>
                              {formatRu(report.date)} • {report.shift === "day" ? "День" : "Ночь"}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                              Готовность: {report.readinessPercent}%
                            </span>
                          </div>

                          <div className="text-sm text-white/85">{toOneLine(report.description)}</div>

                          {report.photos.length > 0 ? (
                            <div className="flex gap-2">
                              {report.photos.slice(0, 3).map((photo) => (
                                <div
                                  key={photo}
                                  className="relative h-16 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5"
                                >
                                  <img
                                    src={photo}
                                    alt="Фото"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <ImageIcon className="h-4 w-4" />
                              Нет фото в отчёте
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DirectorReportView;
