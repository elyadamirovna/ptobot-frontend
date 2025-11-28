import { useCallback, useMemo, useRef, useState } from "react";
import { Plus, Trash, Calendar as CalendarIcon, ImagePlus, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const WORK_TYPES = [
  { value: "concrete", label: "Бетон" },
  { value: "brick", label: "Кладка" },
  { value: "finish", label: "Отделка" },
  { value: "engineering", label: "Инженерия" },
  { value: "other", label: "Другое" },
];

const UNITS = [
  { value: "m3", label: "м³" },
  { value: "m2", label: "м²" },
  { value: "pcs", label: "шт" },
  { value: "m", label: "пог.м" },
];

export function ContractorReportCreate({ onNavigate, onBack }: ContractorReportCreateProps) {
  const [project] = useState("Склад №3");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<"day" | "night">("day");
  const [workItems, setWorkItems] = useState<WorkItem[]>([
    {
      id: "work-0",
      workType: "",
      volume: "",
      unit: "m3",
      comment: "",
      progress: "",
    },
  ]);
  const [workers, setWorkers] = useState("");
  const [machines, setMachines] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(() => {
    const hasWork = workItems.some((item) => item.workType.trim());
    return Boolean(project && date && hasWork);
  }, [date, project, workItems]);

  const handleAddWorkItem = useCallback(() => {
    setWorkItems((prev) => [
      ...prev,
      {
        id: `work-${prev.length}`,
        workType: "",
        volume: "",
        unit: "m3",
        comment: "",
        progress: "",
      },
    ]);
  }, []);

  const handleUpdateItem = useCallback(
    (id: string, patch: Partial<WorkItem>) => {
      setWorkItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    },
    []
  );

  const handleRemoveItem = useCallback((id: string) => {
    setWorkItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)));
  }, []);

  const handlePhotoSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      const limited = files.slice(0, 5 - photos.length);
      const previews = limited.map((file) => URL.createObjectURL(file));
      setPhotos((prev) => [...prev, ...previews].slice(0, 5));
    },
    [photos.length]
  );

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onNavigate?.("/director/report-view");
  }, [canSubmit, onNavigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1533] via-[#0f1d45] to-[#132a59] text-white">
      <div className="mx-auto flex max-w-4xl flex-col px-4 pb-28 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">Прораб</p>
            <h1 className="text-3xl font-semibold leading-tight">Создать отчёт</h1>
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

        <div className="flex flex-col gap-4">
          <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.35)]">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-950">Основные данные смены</CardTitle>
              <p className="text-sm text-slate-500">Заполните объект, дату и смену</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">Объект</label>
                  <Input value={project} readOnly className="h-12 rounded-2xl bg-slate-50 text-base font-semibold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">Дата</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3">
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 flex-1 border-none bg-transparent text-base text-slate-800 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Смена</label>
                <Tabs value={shift} onValueChange={(value) => setShift(value as "day" | "night")} className="w-full">
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
                  <TabsContent value="day" />
                  <TabsContent value="night" />
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.32)]">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-950">Виды работ</CardTitle>
              <p className="text-sm text-slate-500">Добавьте всё, что выполнялось за смену</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {workItems.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-full space-y-2">
                      <label className="text-sm text-slate-600">Вид работ</label>
                      <Select
                        value={item.workType}
                        onValueChange={(value) => handleUpdateItem(item.id, { workType: value })}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white text-base font-medium text-slate-800">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {WORK_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {workItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-7 h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                        aria-label="Удалить блок"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-600">Объём</label>
                      <Input
                        type="number"
                        min="0"
                        value={item.volume}
                        onChange={(e) => handleUpdateItem(item.id, { volume: e.target.value })}
                        placeholder="0"
                        className="h-11 rounded-xl bg-white text-base text-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-600">Ед. изм.</label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) => handleUpdateItem(item.id, { unit: value })}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white text-base font-medium text-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">Комментарий</label>
                    <Textarea
                      value={item.comment}
                      onChange={(e) => handleUpdateItem(item.id, { comment: e.target.value })}
                      rows={3}
                      placeholder="Детали, этап, материалы..."
                      className="rounded-xl bg-white text-base text-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-600">Прогресс по виду (опционально)</label>
                    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={item.progress || "0"}
                        onChange={(e) => handleUpdateItem(item.id, { progress: e.target.value })}
                        className="flex-1 accent-blue-600"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.progress || "0"}
                        onChange={(e) => handleUpdateItem(item.id, { progress: e.target.value })}
                        className="w-20 rounded-lg border border-slate-200 bg-slate-50 text-center text-sm text-slate-800"
                      />
                      <span className="text-sm font-semibold text-slate-700">%</span>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                onClick={handleAddWorkItem}
                className="mt-1 h-12 w-full rounded-2xl border border-dashed border-slate-300 bg-white/70 text-base font-semibold text-slate-800 hover:bg-white"
              >
                <Plus className="h-4 w-4" /> Добавить вид работ
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.32)]">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-950">Ресурсы</CardTitle>
              <p className="text-sm text-slate-500">Сколько людей и техники было на объекте</p>
            </CardHeader>
            <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Рабочие</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Количество человек"
                  value={workers}
                  onChange={(e) => setWorkers(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 text-base text-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Техника</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Единиц техники"
                  value={machines}
                  onChange={(e) => setMachines(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 text-base text-slate-800"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-none bg-white text-slate-900 shadow-[0_18px_60px_rgba(7,24,63,0.32)]">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-950">Фотофиксация</CardTitle>
              <p className="text-sm text-slate-500">До 5 фото, нажмите, чтобы добавить</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo}
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm"
                  >
                    <img src={photo} alt={`Фото ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 5 - photos.length) }).map((_, index) => (
                  <button
                    key={`placeholder-${index}`}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400 hover:text-slate-700"
                  >
                    <div className="flex flex-col items-center gap-2 text-sm font-semibold">
                      <ImagePlus className="h-5 w-5" />
                      <span>+ Фото</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0c1533] via-[#0c1533] to-transparent px-4 pb-[calc(16px+var(--safe-area-bottom,0px))] pt-4 sm:px-6 md:px-8 lg:px-10">
        <Button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="h-14 w-full rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-lg font-semibold text-white shadow-[0_14px_40px_rgba(6,132,240,0.45)] transition hover:brightness-110 disabled:opacity-50"
        >
          Отправить отчёт
        </Button>
      </div>
    </div>
  );
}

export default ContractorReportCreate;
