import React, { useMemo, useState } from "react";
import {
  Building2,
  Camera,
  CheckCircle2,
  ChevronLeft,
  FileText,
  History,
  Image as ImageIcon,
  Layers3,
  Users,
  X,
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
import { Textarea } from "@/components/ui/textarea";
import "./App.css";

type ScreenKey =
  | "dashboard"
  | "create-1"
  | "create-2"
  | "create-3"
  | "success"
  | "history"
  | "report";

type WorkType = { id: string; name: string; unit: "м³" | "м²" };

type ReportRow = {
  id: number;
  project: string;
  date: string;
  workType: string;
  volume: number;
  unit: "м³" | "м²";
  machines: number;
  people: number;
  comment: string;
  photos: string[];
  status: "На проверке" | "Принят" | "Отклонён";
};

const workTypes: WorkType[] = [
  { id: "glass", name: "GLASS", unit: "м²" },
  { id: "beton", name: "Бетон", unit: "м³" },
  { id: "finish", name: "Отделка", unit: "м²" },
];

const projects = [
  { id: "alpha", name: "ЖК «Альфа»" },
  { id: "beta", name: "БЦ «Бета»" },
  { id: "gamma", name: "Промпарк «Гамма»" },
];

const historyRows: ReportRow[] = [
  {
    id: 1,
    project: "alpha",
    date: "2024-12-01",
    workType: "beton",
    volume: 12,
    unit: "м³",
    machines: 2,
    people: 8,
    comment: "Заливка плиты перекрытия, без замечаний.",
    photos: ["https://images.unsplash.com/photo-1503389152951-9f343605f61e?w=600"],
    status: "Принят",
  },
  {
    id: 2,
    project: "beta",
    date: "2024-11-28",
    workType: "glass",
    volume: 42,
    unit: "м²",
    machines: 0,
    people: 6,
    comment: "Монтаж фасадных кассет, часть зоны закрыта погодой.",
    photos: [],
    status: "На проверке",
  },
];

const lastReport = historyRows[0];

const companyName = "ООО «СтройГрупп»";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-800/50">
      <div
        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("dashboard");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const initialDraft = useMemo(
    () => ({
      project: projects[0].id,
      workType: workTypes[0].id,
      date: new Date().toISOString().slice(0, 10),
      volume: "",
      machines: "",
      people: "",
      extraResources: "",
      comment: "",
    }),
    []
  );
  const [reportDraft, setReportDraft] = useState(initialDraft);

  const readiness = useMemo(() => {
    const fields = [reportDraft.project, reportDraft.workType, reportDraft.date, reportDraft.volume];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [reportDraft]);

  const currentUnit =
    workTypes.find((item) => item.id === reportDraft.workType)?.unit || "м³";

  const showExtraResources = [reportDraft.machines, reportDraft.people].some(
    (value) => value && value !== "0"
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const handleStep1Next = () => setScreen("create-2");
  const handleStep2Next = () => setScreen("create-3");
  const handleSubmit = () => setScreen("success");
  const handleReset = () => {
    setReportDraft(initialDraft);
    setPhotoPreviews([]);
    setScreen("dashboard");
  };

  const activeNav = screen === "history" ? "history" : "report";

  const Header = ({
    title,
    showBack,
    onBack,
  }: {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
  }) => (
    <header className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
      <div className="flex items-center gap-3">
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={onBack ?? (() => setScreen("dashboard"))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-200">{companyName}</p>
              <p className="text-sm font-semibold text-white">Dashboard</p>
            </div>
          </div>
        )}
        {showBack && <span className="text-sm font-semibold text-white">{title}</span>}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={handleReset}
      >
        <X className="h-5 w-5" />
      </Button>
    </header>
  );

  const DashboardScreen = () => (
    <div className="space-y-5">
      <Header title="Обзор объекта" />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base text-white">
            Готовность объекта
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-sky-100">
              {workTypes.find((item) => item.id === reportDraft.workType)?.name}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-200">
            <span>Прогресс</span>
            <span className="font-semibold text-white">{readiness}%</span>
          </div>
          <ProgressBar value={readiness} />
          <p className="text-xs text-amber-100">
            {readiness === 100 ? "Все основные поля заполнены" : "Заполните поля, чтобы отправить отчёт"}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base text-white">
            История отчётов
            <History className="h-5 w-5 text-slate-100" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <span>{formatDate(lastReport.date)}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {workTypes.find((row) => row.id === lastReport.workType)?.name}
            </span>
          </div>
          <p className="text-xs text-slate-300">Последний отчёт доступен для просмотра</p>
          <Button
            variant="secondary"
            className="w-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setScreen("history")}
          >
            Открыть историю
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base text-white">
            Доступы и партнёры
            <Users className="h-5 w-5 text-slate-100" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3 text-sm text-slate-100">
          <div>
            <p className="text-xs text-slate-300">Люди</p>
            <p className="text-lg font-semibold text-white">18</p>
          </div>
          <div>
            <p className="text-xs text-slate-300">Партнёры</p>
            <p className="text-lg font-semibold text-white">6</p>
          </div>
          <div>
            <p className="text-xs text-slate-300">Объектов</p>
            <p className="text-lg font-semibold text-white">3 на контроле</p>
          </div>
          <Button className="col-span-3" variant="secondary">
            Управлять ролями
          </Button>
        </CardContent>
      </Card>

      <Button className="w-full bg-sky-500 text-white hover:bg-sky-600" size="lg" onClick={() => setScreen("create-1")}>
        Создать отчёт
      </Button>

      <nav className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white">
        <button
          className={`flex flex-1 flex-col items-center gap-1 ${activeNav === "report" ? "text-sky-100" : "text-slate-300"}`}
          onClick={() => setScreen("dashboard")}
        >
          <FileText className="h-5 w-5" />
          Отчёты
        </button>
        <button
          className={`flex flex-1 flex-col items-center gap-1 ${activeNav === "history" ? "text-sky-100" : "text-slate-300"}`}
          onClick={() => setScreen("history")}
        >
          <History className="h-5 w-5" />
          История
        </button>
        <button
          className={`flex flex-1 flex-col items-center gap-1 ${activeNav === "access" ? "text-sky-100" : "text-slate-300"}`}
          onClick={() => setScreen("dashboard")}
        >
          <Users className="h-5 w-5" />
          Доступ
        </button>
      </nav>
    </div>
  );

  const CreateStep1 = () => (
    <div className="space-y-5">
      <Header title="Ежедневный отчёт" showBack onBack={() => setScreen("dashboard")} />
      <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
        Шаг 1 / 3 — Основные данные
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Основные данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-slate-200">Объект</p>
            <Select
              value={reportDraft.project}
              onValueChange={(project) => setReportDraft((prev) => ({ ...prev, project }))}
            >
              <SelectTrigger className="w-full rounded-2xl bg-white/10 text-white">
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-200">Вид работ</p>
            <Select
              value={reportDraft.workType}
              onValueChange={(workType) => setReportDraft((prev) => ({ ...prev, workType }))}
            >
              <SelectTrigger className="w-full rounded-2xl bg-white/10 text-white">
                <SelectValue placeholder="Выберите вид работ" />
              </SelectTrigger>
              <SelectContent>
                {workTypes.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs text-slate-200">Дата</p>
              <Input
                type="date"
                value={reportDraft.date}
                onChange={(event) =>
                  setReportDraft((prev) => ({ ...prev, date: event.target.value }))
                }
                className="rounded-2xl border-white/10 bg-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-200">Объём</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={reportDraft.volume}
                  onChange={(event) =>
                    setReportDraft((prev) => ({ ...prev, volume: event.target.value }))
                  }
                  className="rounded-2xl border-white/10 bg-white/10 text-white"
                  placeholder="Введите объём"
                />
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white">{currentUnit}</div>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-sky-500 hover:bg-sky-600"
            onClick={handleStep1Next}
            disabled={!readiness || Number(reportDraft.volume) <= 0}
          >
            Далее
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const CreateStep2 = () => (
    <div className="space-y-5">
      <Header title="Ресурсы" showBack onBack={() => setScreen("create-1")} />
      <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
        Шаг 2 / 3 — Ресурсы
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Ресурсы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs text-slate-200">Техника (шт.)</p>
              <Input
                type="number"
                value={reportDraft.machines}
                onChange={(event) =>
                  setReportDraft((prev) => ({ ...prev, machines: event.target.value }))
                }
                className="rounded-2xl border-white/10 bg-white/10 text-white"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-200">Люди (чел.)</p>
              <Input
                type="number"
                value={reportDraft.people}
                onChange={(event) =>
                  setReportDraft((prev) => ({ ...prev, people: event.target.value }))
                }
                className="rounded-2xl border-white/10 bg-white/10 text-white"
                placeholder="0"
              />
            </div>
          </div>

          {showExtraResources && (
            <div className="space-y-2">
              <p className="text-xs text-slate-200">Дополнительные ресурсы (опционально)</p>
              <Textarea
                value={reportDraft.extraResources}
                onChange={(event) =>
                  setReportDraft((prev) => ({ ...prev, extraResources: event.target.value }))
                }
                className="rounded-2xl border-white/10 bg-white/10 text-white"
                placeholder="Краны, вышки и т.п."
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => setScreen("create-1")}
            >
              Назад
            </Button>
            <Button className="flex-1 bg-sky-500 hover:bg-sky-600" onClick={handleStep2Next}>
              Далее
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CreateStep3 = () => (
    <div className="space-y-5 pb-24">
      <Header title="Подтверждение" showBack onBack={() => setScreen("create-2")} />
      <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
        Шаг 3 / 3 — Подтверждение + Фото
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Комментарий и фото</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-slate-200">Комментарий</p>
            <Textarea
              value={reportDraft.comment}
              onChange={(event) =>
                setReportDraft((prev) => ({ ...prev, comment: event.target.value }))
              }
              className="rounded-2xl border-white/10 bg-white/10 text-white"
              placeholder="Добавьте примечание"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-200">Фото</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/30 bg-white/5 px-4 py-6 text-white hover:bg-white/10">
              <Camera className="h-6 w-6" />
              <span className="text-sm">Выбрать фото</span>
              <Input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
            </label>
            {photoPreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-3">
                {photoPreviews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt="Превью"
                    className="h-20 w-24 rounded-xl border border-white/20 object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-[#0b1226]/90 p-4 backdrop-blur">
        <Button className="w-full bg-sky-500 text-white hover:bg-sky-600" size="lg" onClick={handleSubmit}>
          Отправить отчёт
        </Button>
      </div>
    </div>
  );

  return PreviewComponent ? (
    <PreviewComponent />
  ) : (
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
        className="safe-area-page relative z-10 flex min-h-[100dvh] w-full flex-1 justify-center overflow-y-auto px-3 touch-pan-y md:px-4"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorY: "contain" }}
      >
        <div className="mx-auto w-full max-w-full md:max-w-[620px] lg:max-w-[700px]">
          <div className="relative rounded-[32px] px-4 pb-8 pt-6 sm:rounded-[44px] sm:px-6 sm:pb-9 sm:pt-7 lg:rounded-[52px] lg:px-8 lg:pb-10 lg:pt-8">
            <div className="glass-grid-overlay" />
            <div className="relative" ref={swipeAreaRef}>
              <header className="mb-4 flex items-center justify-center sm:mb-6">
                <div
                  className={`
                    flex h-14 w-44 items-center justify-center overflow-hidden
                    rounded-2xl
                    transition-all duration-1000 ease-out delay-100
                    ${logoReveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
                  `}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Логотип компании"
                      className={`
                        h-full w-full object-contain transform-gpu transition-all duration-1000 ease-out
                        ${logoLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-[6px]"}
                      `}
                      onLoad={() => setLogoLoaded(true)}
                    />
                  ) : (
                    <span>Лого</span>
                  )}
                </div>
              </header>

              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <div className="glass-chip border border-white/25 bg-white/10 px-3.5 py-3 text-white shadow-[0_16px_40px_rgba(6,17,44,0.45)] sm:px-4">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
                    <span>Готовность</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/70">glass</span>
                  </div>
                  <div className="mt-1 flex items-end justify-between">
                    <span className="text-[22px] font-semibold sm:text-[24px]">{formCompletion}%</span>
                    <span className="rounded-full bg-emerald-300/20 px-2 py-1 text-[10px] font-medium text-emerald-100">
                      {isFormReady ? "готово" : "заполните поля"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300/90 via-indigo-300/80 to-emerald-300/90"
                      style={{ width: `${formCompletion}%` }}
                    />
                  </div>
                </div>

                <div className="glass-chip border border-white/25 bg-white/10 px-3.5 py-3 text-white shadow-[0_16px_40px_rgba(6,17,44,0.45)] sm:px-4">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
                    <span>История</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/70">{history.length} отчёта</span>
                  </div>
                  <div className="mt-1 flex items-end justify-between">
                    <span className="text-[22px] font-semibold sm:text-[24px]">
                      {latestHistoryDate ? formatRu(latestHistoryDate) : "—"}
                    </span>
                    <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-medium text-white/80">
                      {workTypes.find((item) => item.id === workType)?.name ?? "Виды работ"}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-white/70">Последний отчёт открыт для просмотра.</p>
                </div>

                <div className="glass-chip border border-white/25 bg-white/10 px-3.5 py-3 text-white shadow-[0_16px_40px_rgba(6,17,44,0.45)] sm:px-4">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
                    <span>Доступы</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/70">{accessList.length} партнёра</span>
                  </div>
                  <div className="mt-1 flex items-end justify-between">
                    <span className="text-[22px] font-semibold sm:text-[24px]">{projects.length}</span>
                    <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-medium text-white/80">
                      объектов на контроле
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-white/70">Управляйте ролями прямо в мини-приложении.</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as TabKey)}
                className="w-full"
              >
                <TabsList className="glass-chip mb-4 grid grid-cols-3 gap-1 rounded-full bg-white/12 p-1 text-[11px] text-white/80 shadow-[0_14px_40px_rgba(6,17,44,0.45)] sm:mb-5 sm:text-[12px]">
                  <TabsTrigger
                    value="report"
                    className="flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[10px] transition data-[state=active]:bg-white data-[state=active]:text-sky-900 data-[state=active]:shadow-[0_12px_30px_rgba(255,255,255,0.45)] sm:px-3 sm:py-2 sm:text-[12px]"
                  >
                    <ClipboardList className="h-3.5 w-3.5" /> Отчёт
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[10px] transition data-[state=active]:bg-white data-[state=active]:text-sky-900 data-[state=active]:shadow-[0_12px_30px_rgba(255,255,255,0.45)] sm:px-3 sm:py-2 sm:text-[12px]"
                  >
                    <History className="h-3.5 w-3.5" /> История
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[10px] transition data-[state=active]:bg-white data-[state=active]:text-sky-900 data-[state=active]:shadow-[0_12px_30px_rgba(255,255,255,0.45)] sm:px-3 sm:py-2 sm:text-[12px]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Доступ
                  </TabsTrigger>
                </TabsList>

                {/* TAB: ОТЧЁТ */}
                <TabsContent value="report" className="mt-0">
                  <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
                    <CardHeader className="pb-5 sm:pb-6">
                      <CardTitle className="text-[18px] font-semibold tracking-wide text-white sm:text-[20px]">
                        Ежедневный отчёт
                      </CardTitle>
                      <p className="text-xs text-white/80">{formatRu(date)}</p>
                    </CardHeader>
                    <CardContent className="space-y-6 text-[12px] sm:p-7 sm:pt-1 sm:text-[13px]">
                      <div className="grid gap-3 rounded-3xl border border-white/20 bg-white/5 p-4 backdrop-blur-xl">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                            Объект
                          </p>
                          <div className="relative">
                            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                            <Select value={project} onValueChange={setProject}>
                              <SelectTrigger className="h-11 rounded-2xl border border-white/20 bg-white/10 pl-11 pr-12 text-[13px] font-medium text-white/90 shadow-[0_16px_38px_rgba(7,24,74,0.55)] backdrop-blur sm:h-12 sm:text-[14px]">
                                <SelectValue placeholder="Выберите объект" />
                              </SelectTrigger>
                              <SelectContent className="border border-white/15 bg-[#07132F]/95 text-white">
                                {projects.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                            Вид работ
                          </p>
                          <div className="relative">
                            <HardHat className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                            <Select value={workType} onValueChange={setWorkType}>
                              <SelectTrigger className="h-11 rounded-2xl border border-white/20 bg-white/10 pl-11 pr-12 text-[13px] font-medium text-white/90 shadow-[0_16px_38px_rgba(7,24,74,0.55)] backdrop-blur sm:h-12 sm:text-[14px]">
                                <SelectValue placeholder="Выберите вид работ" />
                              </SelectTrigger>
                              <SelectContent className="border border-white/15 bg-[#07132F]/95 text-white">
                                {workTypes.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                            Дата
                          </p>
                          <div className="relative">
                            <Input
                              type="date"
                              value={date}
                              onChange={(event) => setDate(event.target.value)}
                              className="h-11 rounded-2xl border border-white/20 bg-white/10 pl-12 pr-12 text-[13px] font-medium text-white/90 placeholder:text-white/50 [appearance:none] sm:h-12 sm:text-[14px]"
                            />
                            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                            Объём
                          </p>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="12,5"
                              value={volume}
                              onChange={(event) => setVolume(event.target.value)}
                              className="h-11 flex-1 rounded-2xl border border-white/20 bg-white/10 text-[13px] font-medium text-white/90 placeholder:text-white/40 sm:h-12 sm:text-[14px]"
                            />
                            <div className="flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3 text-[11px] text-white/75 sm:h-12 sm:px-4 sm:text-[12px]">
                              м³
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                            Техника
                          </p>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="3"
                              value={machines}
                              onChange={(event) =>
                                setMachines(event.target.value)
                              }
                              className="h-11 flex-1 rounded-2xl border border-white/20 bg-white/10 text-[13px] font-medium text-white/90 placeholder:text-white/40 sm:h-12 sm:text-[14px]"
                            />
                            <div className="flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3 text-[11px] text-white/75 sm:h-12 sm:px-4 sm:text-[12px]">
                              шт.
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                          Люди
                        </p>
                        <div className="relative">
                          <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                          <Input
                            inputMode="numeric"
                            placeholder="кол-во человек"
                            value={people}
                            onChange={(event) => setPeople(event.target.value)}
                            className="h-11 rounded-2xl border border-white/20 bg-white/10 pl-11 text-[13px] font-medium text-white/90 placeholder:text-white/40 sm:h-12 sm:text-[14px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                          Комментарий
                        </p>
                        <Textarea
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                          placeholder="Кратко опишите выполненные работы…"
                          className="min-h-[80px] rounded-3xl border border-white/20 bg-white/10 text-[12px] text-white/90 placeholder:text-white/45 sm:min-h-[96px] sm:text-[13px]"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65 sm:text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="h-3.5 w-3.5" /> Выберите фото
                          </span>
                          <span className="text-white/55">
                            JPG/PNG/HEIC, до 10 МБ
                          </span>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={onFilesSelected}
                        />

                        <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-white/30 bg-white/5 px-4 py-3 text-sm text-white/75 sm:flex-row sm:items-center">
                          <div className="flex-1 text-[11px] leading-tight sm:text-[12px]">
                            Перетащите фото или нажмите «Выбрать»
                          </div>
                          <Button
                            type="button"
                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-4 py-1.5 text-[12px] font-semibold text-sky-900 shadow-[0_18px_50px_rgba(3,144,255,0.9)] hover:brightness-110"
                            onClick={onPickFiles}
                          >
                            <Upload className="h-3.5 w-3.5" /> Выбрать
                          </Button>
                          {Boolean(files.length) && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-8 rounded-full border-white/30 bg-white/15 px-3 text-[11px] text-white/80 backdrop-blur hover:bg-white/25"
                              onClick={() => {
                                setFiles([]);
                                setPreviews([]);
                                setFileValidationMessage(
                                  "Добавьте хотя бы одно фото для отчёта"
                                );
                              }}
                            >
                              Очистить
                            </Button>
                          )}
                        </div>

                        {fileValidationMessage && (
                          <p className="text-[10px] font-medium text-amber-200/90 sm:text-[11px]">
                            {fileValidationMessage}
                          </p>
                        )}

                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-3 sm:gap-3">
                            {(previews.length ? previews : [null, null, null])
                              .slice(0, 3)
                              .map((src, index) => (
                                <div
                                  key={index}
                                className="flex aspect-square items-center justify-center rounded-xl border border-white/20 bg-white/5 sm:aspect-[4/3] sm:rounded-2xl"
                              >
                                {src ? (
                                  <img
                                    src={src}
                                    alt="Предпросмотр"
                                    className="h-full w-full rounded-xl object-cover sm:rounded-2xl"
                                  />
                                ) : (
                                  <span className="text-[10px] text-white/45 sm:text-[11px]">
                                    Фото
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button
                            type="button"
                            className="h-11 rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-6 text-[12px] font-semibold text-sky-900 shadow-[0_24px_60px_rgba(3,144,255,0.85)] hover:brightness-110 disabled:opacity-70 sm:text-[13px]"
                            onClick={sendReport}
                            disabled={sending || !isFormReady}
                          >
                            {sending ? "Отправка…" : "Отправить отчёт"}
                          </Button>
                          <div className="flex-1">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        {requiredHintVisible && !isFormReady && (
                          <p className="text-[10px] font-medium text-amber-100/90 sm:text-[11px]">
                            Чтобы отправить отчёт, заполните: {missingFields.join(", ")}.
                          </p>
                        )}
                        {progress > 0 && (
                          <p className="text-[10px] text-white/70 sm:text-[11px]">
                            Загрузка: {progress}%
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: ИСТОРИЯ */}
                <TabsContent value="history" className="mt-0">
                  <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
                    <CardHeader className="pb-5 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-white sm:text-[18px]">
                        <History className="h-4 w-4" /> История отчётов
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-[11px] sm:p-7 sm:pt-1 sm:text-[12px]">
                      <div className="grid gap-3 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                        <div className="grid gap-3 sm:grid-cols-4">
                          <div className="space-y-1.5 sm:col-span-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                              Объект
                            </p>
                            <Select value={project} onValueChange={setProject}>
                              <SelectTrigger className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]">
                                <SelectValue placeholder="Объект" />
                              </SelectTrigger>
                              <SelectContent className="border border-white/15 bg-[#07132F]/95 text-white">
                                {projects.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                              С даты
                            </p>
                            <Input
                              type="date"
                              className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                              По дату
                            </p>
                            <Input
                              type="date"
                              className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {history
                          .filter((item) => item.project_id === project)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="rounded-[22px] border border-white/12 bg-white/8 p-4 text-white/85 shadow-[0_14px_36px_rgba(6,17,44,0.35)] backdrop-blur"
                            >
                              <div className="flex flex-col gap-1 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:text-[12px]">
                                <span>{formatRu(item.date)}</span>
                                <span className="text-white/75">
                                  {
                                    workTypes.find(
                                      (row) => row.id === item.work_type_id
                                    )?.name
                                  }
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-white/85 sm:text-[12px]">
                                {toOneLine(item.description)}
                              </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {item.photos.map((src, index) => (
                                    <img
                                      key={index}
                                      src={src}
                                      alt="Фото отчёта"
                                    className="h-14 w-20 rounded-lg border border-white/35 object-cover sm:h-16 sm:w-24 sm:rounded-xl"
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: ДОСТУП */}
                <TabsContent value="admin" className="mt-0">
                  <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
                    <CardHeader className="pb-5 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-white sm:text-[18px]">
                        <ShieldCheck className="h-4 w-4" /> Назначение доступа
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-[11px] sm:p-7 sm:pt-1 sm:text-[12px]">
                      <div className="grid gap-3 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1.5 sm:col-span-1">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                              Найти подрядчика
                            </p>
                            <Input
                              placeholder="Поиск по названию / Telegram"
                              className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 placeholder:text-white/50 sm:text-[12px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                              Объект
                            </p>
                            <Select value={project} onValueChange={setProject}>
                              <SelectTrigger className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]">
                                <SelectValue placeholder="Выберите объект" />
                              </SelectTrigger>
                              <SelectContent className="border border-white/15 bg-[#07132F]/95 text-white">
                                {projects.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                              Роль
                            </p>
                            <Select defaultValue="reporter">
                              <SelectTrigger className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]">
                                <SelectValue placeholder="Роль" />
                              </SelectTrigger>
                              <SelectContent className="border border-white/15 bg-[#07132F]/95 text-white">
                                <SelectItem value="reporter">
                                  Может отправлять отчёты
                                </SelectItem>
                                <SelectItem value="viewer">
                                  Только просмотр
                                </SelectItem>
                                <SelectItem value="manager">
                                  Менеджер
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65 sm:text-[11px]">
                          Текущие назначения
                        </p>
                          <div className="space-y-2">
                            {accessList.map((row, index) => (
                              <div
                                key={index}
                                className="flex flex-col gap-3 rounded-[18px] border border-white/12 bg-white/8 px-4 py-3 shadow-[0_12px_30px_rgba(6,17,44,0.35)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                              >
                              <div>
                                <div className="text-[12px] font-medium text-white/90 sm:text-[13px]">
                                  {row.user.name}
                                </div>
                                <div className="text-[10px] text-white/65 sm:text-[11px]">
                                  Проекты:{" "}
                                  {row.projects
                                    .map(
                                      (pid) =>
                                        projects.find((p) => p.id === pid)
                                          ?.name
                                    )
                                    .join(", ")}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white/70 sm:text-[11px]">
                                  Роль: {row.role}
                                </span>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-8 rounded-full border-none bg-white/85 px-3 text-[10px] font-semibold text-sky-800 shadow-[0_12px_32px_rgba(3,144,255,0.55)] hover:brightness-110 sm:text-[11px]"
                                >
                                  Изменить
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400">Комментарий</p>
            <p className="text-white">{lastReport.comment}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Фото</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {lastReport.photos.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt="Фото"
                  className="h-24 w-28 rounded-xl border border-white/20 object-cover"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const screenMap: Record<ScreenKey, JSX.Element> = {
    dashboard: <DashboardScreen />,
    "create-1": <CreateStep1 />,
    "create-2": <CreateStep2 />,
    "create-3": <CreateStep3 />,
    success: <SuccessScreen />,
    history: <HistoryScreen />,
    report: <ReportDetail />,
  };

  return (
    <div className="app-shell">
      <main className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        {screenMap[screen]}
      </main>
    </div>
  );
}
