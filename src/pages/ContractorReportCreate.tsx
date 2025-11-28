import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarIcon,
  Image as ImageIcon,
  Plus,
} from "lucide-react";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ContractorReportCreateProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
}

type WorkItem = {
  id: string;
  workType: string;
  volume: string;
  unit: string;
  comment: string;
  progress?: string;
};

function getInitialWorkItem(): WorkItem {
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    workType: "",
    volume: "",
    unit: "",
    comment: "",
    progress: "",
  };
}

export function ContractorReportCreate({ onNavigate, onBack }: ContractorReportCreateProps) {
  const [project] = useState("ЖК «Северный»");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<"day" | "night">("day");
  const [workItems, setWorkItems] = useState<WorkItem[]>([getInitialWorkItem()]);
  const [workers, setWorkers] = useState("");
  const [machines, setMachines] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const workOptions = useMemo(
    () => ["Бетон", "Кладка", "Отделка", "Инженерия", "Другое"],
    []
  );
  const unitOptions = useMemo(() => ["м³", "м²", "шт", "пог.м"], []);

  const canSubmit = useMemo(() => {
    const hasBaseData = Boolean(project && date && shift);
    const hasWorkItems = workItems.length > 0;
    const workItemsValid = workItems.every(
      (item) => item.workType && item.volume && item.unit
    );

    return hasBaseData && hasWorkItems && workItemsValid;
  }, [date, project, shift, workItems]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    window.history.back();
  }, [onBack]);

  const updateWorkItem = useCallback(
    (id: string, field: keyof WorkItem, value: string) => {
      setWorkItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    },
    []
  );

  const addWorkItem = useCallback(() => {
    setWorkItems((prev) => [...prev, getInitialWorkItem()]);
  }, []);

  const handlePhotosChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 5);
    const nextPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotos(files);
    setPhotoPreviews(nextPreviews);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const triggerFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onNavigate?.("/director/report-view");
  }, [canSubmit, onNavigate]);

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
        className="safe-area-page relative z-10 flex min-h-[100dvh] w-full flex-1 justify-center overflow-y-auto px-3 pb-24 pt-8 touch-pan-y md:px-4"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorY: "contain" }}
      >
        <div className="mx-auto w-full max-w-full md:max-w-[620px] lg:max-w-[700px]">
          <div className="relative rounded-[32px] px-1 pb-10 sm:rounded-[44px] sm:px-2 sm:pb-12 lg:rounded-[52px] lg:px-3 lg:pb-14">
            <div className="glass-grid-overlay" />
            <div className="relative space-y-5">
              <header className="flex items-center justify-between gap-3 rounded-3xl bg-white/10 px-4 py-3 backdrop-blur-md">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    ПОДРЯДЧИК / ПРОРАБ
                  </p>
                  <h1 className="text-2xl font-semibold text-white sm:text-[28px]">
                    Создать сменный отчёт
                  </h1>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="h-11 rounded-full border-none bg-white/85 px-4 text-sm font-semibold text-sky-900 shadow-[0_12px_32px_rgba(3,144,255,0.45)] hover:brightness-110"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
              </header>

              <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.35)]">
                <CardHeader className="space-y-1 pb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Основные данные
                  </p>
                  <CardTitle className="text-2xl font-semibold text-slate-900">
                    Основные данные смены
                  </CardTitle>
                  <p className="text-sm text-slate-500">Заполните объект, дату и смену</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800">Объект</label>
                    <div className="h-12 rounded-2xl bg-slate-50 px-4 text-base font-semibold text-slate-800 shadow-inner">
                      <div className="flex h-full items-center">{project}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800">Дата</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 shadow-inner">
                      <CalendarIcon className="h-4 w-4 text-slate-500" />
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-12 border-none bg-transparent px-0 text-base font-semibold text-slate-800 focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">Смена</label>
                    <Tabs value={shift} onValueChange={(value) => setShift(value as "day" | "night")}> 
                      <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
                        <TabsTrigger
                          value="day"
                          className="h-11 rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                        >
                          День
                        </TabsTrigger>
                        <TabsTrigger
                          value="night"
                          className="h-11 rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                        >
                          Ночь
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.35)]">
                <CardHeader className="space-y-1 pb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Виды работ</p>
                  <CardTitle className="text-2xl font-semibold text-slate-900">Виды работ</CardTitle>
                  <p className="text-sm text-slate-500">Добавьте всё, что выполнялось за смену</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {workItems.map((item, index) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50/80 p-4 shadow-inner">
                      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
                        <span>Вид работ #{index + 1}</span>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-800">Вид работ</label>
                          <Select
                            value={item.workType}
                            onValueChange={(value) => updateWorkItem(item.id, "workType", value)}
                          >
                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white text-base font-semibold text-slate-800">
                              <SelectValue placeholder="Выберите" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {workOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-800">Объём</label>
                            <Input
                              type="number"
                              value={item.volume}
                              onChange={(e) => updateWorkItem(item.id, "volume", e.target.value)}
                              className="h-12 rounded-2xl border-slate-200 bg-white text-base font-semibold text-slate-800"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-800">Ед. изм.</label>
                            <Select
                              value={item.unit}
                              onValueChange={(value) => updateWorkItem(item.id, "unit", value)}
                            >
                              <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white text-base font-semibold text-slate-800">
                                <SelectValue placeholder="Выберите" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                {unitOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-800">Комментарий</label>
                          <Textarea
                            value={item.comment}
                            onChange={(e) => updateWorkItem(item.id, "comment", e.target.value)}
                            className="min-h-[96px] rounded-2xl border-slate-200 bg-white text-base font-semibold text-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                            <span>Прогресс по виду (опционально)</span>
                            <span className="text-slate-500">{item.progress || "0"}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={item.progress || "0"}
                              onChange={(e) => updateWorkItem(item.id, "progress", e.target.value)}
                              className="h-2 w-full accent-sky-500"
                            />
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step={5}
                              value={item.progress || "0"}
                              onChange={(e) => updateWorkItem(item.id, "progress", e.target.value)}
                              className="h-11 w-20 rounded-2xl border-slate-200 bg-white text-base font-semibold text-slate-800"
                            />
                            <span className="text-base font-semibold text-slate-800">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    onClick={addWorkItem}
                    className="h-12 w-full rounded-2xl border border-dashed border-slate-300 bg-white/70 text-base font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Добавить вид работ
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.35)]">
                <CardHeader className="space-y-1 pb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Ресурсы</p>
                  <CardTitle className="text-2xl font-semibold text-slate-900">Ресурсы</CardTitle>
                  <p className="text-sm text-slate-500">Сколько людей и техники было на объекте</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800">Рабочие</label>
                    <Input
                      type="number"
                      value={workers}
                      onChange={(e) => setWorkers(e.target.value)}
                      placeholder="Количество человек"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-base font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800">Техника</label>
                    <Input
                      type="number"
                      value={machines}
                      onChange={(e) => setMachines(e.target.value)}
                      placeholder="Единиц техники"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-base font-semibold text-slate-800"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.35)]">
                <CardHeader className="space-y-1 pb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Фотофиксация</p>
                  <CardTitle className="text-2xl font-semibold text-slate-900">Фотофиксация</CardTitle>
                  <p className="text-sm text-slate-500">До 5 фото, нажмите, чтобы добавить</p>
                </CardHeader>
                <CardContent>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosChange}
                    className="hidden"
                  />
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {photoPreviews.map((preview, index) => (
                      <div
                        key={preview}
                        className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-100"
                      >
                        <img
                          src={preview}
                          alt={`Фото ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute inset-0 flex items-center justify-center bg-slate-900/55 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          Удалить
                        </button>
                      </div>
                    ))}

                    {photoPreviews.length < 5 && (
                      <button
                        type="button"
                        onClick={triggerFileDialog}
                        className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <ImageIcon className="mb-1 h-5 w-5 text-slate-500" />
                        + Фото
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div className="fixed inset-x-0 bottom-4 z-30 px-4">
        <div className="mx-auto w-full max-w-full md:max-w-[620px] lg:max-w-[700px]">
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="h-14 w-full rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(3,113,255,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Отправить отчёт
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ContractorReportCreate;
