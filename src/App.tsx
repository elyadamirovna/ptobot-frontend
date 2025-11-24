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

  const SuccessScreen = () => (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-white">
      <CheckCircle2 className="h-16 w-16 text-emerald-400" />
      <div>
        <p className="text-xl font-semibold">Отчёт успешно отправлен</p>
        <p className="text-sm text-slate-200">Можете просмотреть его в истории</p>
      </div>
      <div className="flex w-full max-w-md gap-3">
        <Button className="flex-1" variant="outline" onClick={() => setScreen("history")}>К истории</Button>
        <Button className="flex-1 bg-sky-500 hover:bg-sky-600" onClick={handleReset}>
          На главную
        </Button>
      </div>
    </div>
  );

  const HistoryScreen = () => (
    <div className="space-y-5">
      <Header title="История отчётов" showBack onBack={() => setScreen("dashboard")} />
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Список отчётов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyRows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3 text-sm text-slate-100"
            >
              <div>
                <p className="font-semibold text-white">{formatDate(row.date)}</p>
                <p className="text-xs text-slate-300">{workTypes.find((w) => w.id === row.workType)?.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="rounded-full bg-white/10 px-3 py-1">{row.status}</span>
                {row.photos.length > 0 && <ImageIcon className="h-4 w-4" />}
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setScreen("report")}
                >
                  Открыть
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const ReportDetail = () => (
    <div className="space-y-5 pb-4">
      <Header title="Отчёт" showBack onBack={() => setScreen("history")} />
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building2 className="h-5 w-5" /> Обзор
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400">Объект</p>
              <p className="text-white">{projects.find((p) => p.id === lastReport.project)?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Дата</p>
              <p className="text-white">{formatDate(lastReport.date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Вид работ</p>
              <p className="text-white">{workTypes.find((w) => w.id === lastReport.workType)?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Объём</p>
              <p className="text-white">
                {lastReport.volume} {lastReport.unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Техника</p>
              <p className="text-white">{lastReport.machines} шт.</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Люди</p>
              <p className="text-white">{lastReport.people} чел.</p>
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
