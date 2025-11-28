import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon, HardHat, Users, Truck, ArrowUpRight } from "lucide-react";

interface DirectorReportViewProps {
  onBack?: () => void;
}

const SAMPLE_REPORT = {
  date: "2024-12-03",
  object: "Склад №3, логистический комплекс",
  shift: "День",
  foreman: "Иванов Пётр",
  works: [
    {
      title: "Бетон",
      volume: "85",
      unit: "м³",
      comment: "Залили плиту под колонны, армирование завершено",
      progress: 90,
    },
    {
      title: "Кладка",
      volume: "120",
      unit: "м²",
      comment: "Несущие перегородки 2 этажа",
      progress: 60,
    },
    {
      title: "Инженерия",
      volume: "45",
      unit: "пог.м",
      comment: "Воздуховоды по трассе B, без замечаний",
      progress: undefined,
    },
  ],
  resources: {
    workers: 24,
    machines: 4,
  },
  photos: [
    "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=900&q=60",
  ],
};

export function DirectorReportView({ onBack }: DirectorReportViewProps) {
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  const columns = SAMPLE_REPORT.photos.length <= 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1533] via-[#0f1d45] to-[#132a59] text-white">
      <div className="mx-auto flex max-w-4xl flex-col px-4 pb-24 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">Руководитель</p>
            <h1 className="text-3xl font-semibold leading-tight">Отчёт по объекту</h1>
          </div>
          <Button
            onClick={() => (onBack ? onBack() : window.history.back())}
            variant="secondary"
            size="sm"
            className="h-10 rounded-full border border-white/40 bg-white/10 px-4 text-sm text-white hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" /> Назад
          </Button>
        </div>

        {!fullscreenPhoto && (
          <div className="flex flex-col gap-4">
            <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.35)]">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-slate-950">Сводка смены</CardTitle>
                <p className="text-sm text-slate-500">Ключевые данные по дате и смене</p>
              </CardHeader>
              <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarIcon className="h-4 w-4" /> Дата
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{SAMPLE_REPORT.date}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 text-slate-500">
                    <HardHat className="h-4 w-4" /> Объект
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{SAMPLE_REPORT.object}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ArrowUpRight className="h-4 w-4" /> Смена
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{SAMPLE_REPORT.shift}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="h-4 w-4" /> Прораб
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{SAMPLE_REPORT.foreman}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.32)]">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-slate-950">Выполненные работы</CardTitle>
                <p className="text-sm text-slate-500">По структуре заполнения подрядчика</p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {SAMPLE_REPORT.works.map((work) => (
                  <div
                    key={work.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-slate-950">{work.title}</p>
                      {typeof work.progress === "number" && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          {work.progress}%
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-[1.2fr_0.8fr]">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500">Комментарий</span>
                        <p className="leading-relaxed text-slate-900">{work.comment || "—"}</p>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-slate-800">
                        <span className="mt-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          Объём
                        </span>
                        <p className="text-base font-semibold text-slate-900">
                          {work.volume} {work.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.32)]">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-slate-950">Ресурсы</CardTitle>
                <p className="text-sm text-slate-500">Численность людей и техники</p>
              </CardHeader>
              <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <Users className="h-10 w-10 rounded-xl bg-blue-50 p-2 text-blue-700" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Рабочие</p>
                    <p className="text-xl font-semibold text-slate-950">{SAMPLE_REPORT.resources.workers} чел.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <Truck className="h-10 w-10 rounded-xl bg-blue-50 p-2 text-blue-700" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Техника</p>
                    <p className="text-xl font-semibold text-slate-950">{SAMPLE_REPORT.resources.machines} ед.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.32)]">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-slate-950">Фотофиксация</CardTitle>
                <p className="text-sm text-slate-500">Мини-превью, тап — полноэкранно</p>
              </CardHeader>
              <CardContent className="pt-0">
                {SAMPLE_REPORT.photos.length === 0 ? (
                  <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                    Фото отсутствуют
                  </div>
                ) : (
                  <div className={`grid gap-3 ${columns}`}>
                    {SAMPLE_REPORT.photos.map((photo) => (
                      <button
                        key={photo}
                        type="button"
                        onClick={() => setFullscreenPhoto(photo)}
                        className="group relative overflow-hidden rounded-2xl bg-slate-100 shadow-sm"
                      >
                        <img src={photo} alt="Превью" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/35 via-black/5 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                          <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">Развернуть</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {fullscreenPhoto && (
          <div className="relative mt-2 flex flex-1 flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Фотофиксация</p>
                <h2 className="text-2xl font-semibold leading-tight">Полноэкранный просмотр</h2>
              </div>
              <Button
                onClick={() => setFullscreenPhoto(null)}
                variant="secondary"
                size="sm"
                className="h-10 rounded-full border border-white/40 bg-white/10 px-4 text-sm text-white hover:bg-white/15"
              >
                Закрыть
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/20 shadow-2xl">
              <img src={fullscreenPhoto} alt="Полноэкранное фото" className="h-[60vh] w-full object-cover sm:h-[70vh]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>
        )}
      </div>

      {!fullscreenPhoto && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0c1533] via-[#0c1533] to-transparent px-4 pb-[calc(16px+var(--safe-area-bottom,0px))] pt-4 sm:px-6 md:px-8 lg:px-10">
          <Button
            onClick={() => (onBack ? onBack() : window.history.back())}
            variant="secondary"
            className="h-14 w-full rounded-full border border-white/60 bg-white/10 text-lg font-semibold text-white backdrop-blur hover:bg-white/15"
          >
            Назад
          </Button>
        </div>
      )}
    </div>
  );
}

export default DirectorReportView;
