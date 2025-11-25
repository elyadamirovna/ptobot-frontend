import { useEffect, useState } from "react";
import { ChevronLeft, CheckCircle2, Image as ImageIcon, Plus } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultPhotos,
  projectsMock,
  reportsMock,
  unitOptions,
  workTypeOptions,
} from "@/lib/mockData";
import type { Project, Report, Role, WorkItem } from "@/types/reports";

const todayISO = new Date().toISOString().slice(0, 10);

type ForemanScreenKey =
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7";

type ManagerScreenKey = "D1" | "D2" | "D3" | "D4";

type Screen =
  | { key: ForemanScreenKey; projectId?: string; reportId?: string }
  | { key: ManagerScreenKey; projectId?: string; reportId?: string };

const shiftLabels: Record<NonNullable<Report["shift"]>, string> = {
  day: "День",
  night: "Ночь",
};

const statusLabels: Record<NonNullable<Project["status"]>, string> = {
  on_track: "в срок",
  delayed: "отставание",
  no_reports: "нет отчётов",
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const createEmptyWorkItem = (): WorkItem => ({
  id: crypto.randomUUID(),
  type: "",
  unit: unitOptions[0],
  readinessPercent: 50,
});

const createDraftReport = (): Report => ({
  id: "draft",
  projectId: "",
  date: todayISO,
  shift: "day",
  works: [createEmptyWorkItem()],
  resources: { workersCount: undefined, machinesCount: undefined },
  comment: "",
  photos: [],
  foremanName: "Иван Петров",
  objectReadinessPercent: undefined,
  hasProblems: false,
});

function Badge({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "success" | "danger" | "info" }) {
  const toneClasses: Record<typeof tone, string> = {
    neutral: "bg-white/10 text-white",
    success: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40",
    danger: "bg-rose-500/15 text-rose-200 border border-rose-400/40",
    info: "bg-sky-500/15 text-sky-100 border border-sky-400/40",
  } as const;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

const SafeCard = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <Card className="glass-panel border-white/10 bg-white/5 text-white">
    {title ? (
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white/90">{title}</CardTitle>
      </CardHeader>
    ) : null}
    <CardContent className="space-y-3 text-white/90">{children}</CardContent>
  </Card>
);

export default function App() {
  const [role, setRole] = useState<Role>("foreman");
  const [screen, setScreen] = useState<Screen>({ key: "F1" });
  const [projects, setProjects] = useState<Project[]>(projectsMock);
  const [reports, setReports] = useState<Report[]>(reportsMock);
  const [draft, setDraft] = useState<Report>(() => createDraftReport());
  const [managerProjectFilter, setManagerProjectFilter] = useState<"all" | "on_track" | "delayed">("all");
  const [managerReportsFilter, setManagerReportsFilter] = useState<
    "week" | "month" | "all" | "problems"
  >("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    if (roleParam === "manager" || roleParam === "foreman") {
      setRole(roleParam);
      setScreen({ key: roleParam === "manager" ? "D1" : "F1" });
    }
  }, []);

  useEffect(() => {
    setScreen((prev) => ({ key: role === "manager" ? "D1" : "F1", projectId: prev.projectId }));
  }, [role]);

  useEffect(() => {
    if (screen.key === "D1") setManagerProjectFilter("all");
    if (screen.key === "D2") setManagerReportsFilter("all");
  }, [screen.key]);

  const lastReportForProject = (projectId: string) =>
    reports
      .filter((r) => r.projectId === projectId)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

  const handleStartReport = (projectId?: string) => {
    if (role === "manager") return;
    setDraft((prev) => ({
      ...createDraftReport(),
      projectId: projectId ?? prev.projectId ?? projects[0]?.id ?? "",
    }));
    setScreen({ key: "F3", projectId: projectId ?? draft.projectId ?? projects[0]?.id });
  };

  const handleAddWorkItem = () => {
    setDraft((prev) => ({ ...prev, works: [...prev.works, createEmptyWorkItem()] }));
  };

  const handleWorkChange = (id: string, field: keyof WorkItem, value: string | number) => {
    setDraft((prev) => ({
      ...prev,
      works: prev.works.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const step1Valid = draft.projectId && draft.date;
  const step2Valid = draft.works.some((w) => w.type && w.volume);

  const goToPreview = () => {
    if (!step1Valid || !step2Valid) return;
    setScreen({ key: "F6", projectId: draft.projectId });
  };

  const handleSubmitReport = () => {
    const enrichedReport: Report = {
      ...draft,
      id: `new-${Date.now()}`,
      hasProblems: Boolean(draft.comment?.match(/проблем|задерж|риск/iu)),
      photos: draft.photos.length ? draft.photos : defaultPhotos.slice(0, 1),
    };
    setReports((prev) => [enrichedReport, ...prev]);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === enrichedReport.projectId
          ? { ...p, lastReportDate: enrichedReport.date, status: p.status ?? "on_track" }
          : p
      )
    );
    setScreen({ key: "F7", projectId: enrichedReport.projectId });
  };

  const filteredReportsByProject = (projectId?: string) =>
    projectId ? reports.filter((r) => r.projectId === projectId) : reports;

  const managerReportFilters = (projectId: string, scope: "week" | "month" | "all" | "problems") => {
    const items = filteredReportsByProject(projectId);
    if (scope === "problems") return items.filter((r) => r.hasProblems);
    if (scope === "week" || scope === "month") {
      const limitDays = scope === "week" ? 7 : 30;
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - limitDays);
      return items.filter((r) => new Date(r.date) >= limitDate);
    }
    return items;
  };

  const addPhotoPreview = () => {
    const nextPhoto = defaultPhotos[draft.photos.length % defaultPhotos.length];
    setDraft((prev) => ({
      ...prev,
      photos: [...prev.photos, { ...nextPhoto, id: `${nextPhoto.id}-${prev.photos.length}` }],
    }));
  };

  const resetToProjectList = () => {
    setScreen({ key: role === "manager" ? "D1" : "F1" });
  };

  const renderHeader = () => (
    <header className="flex items-center justify-between pb-4 text-white/90">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">PTObot · mini app</p>
        <h1 className="text-2xl font-semibold">
          {role === "foreman" ? "Ежедневные отчёты" : "Дэшборд объектов"}
        </h1>
      </div>
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs">
        <span className="text-white/70">Роль</span>
        <Select value={role} onValueChange={(value: Role) => setRole(value)}>
          <SelectTrigger className="w-[120px] border-white/20 bg-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 text-white">
            <SelectItem value="foreman">Прораб</SelectItem>
            <SelectItem value="manager">Руководитель</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );

  const renderForemanHome = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 text-white/80">
        <h2 className="text-xl font-semibold">Добрый день, Иван</h2>
        <p className="text-sm text-white/60">Объекты под вашим контролем</p>
      </div>
      <div className="space-y-3">
        {projects.map((project) => {
          const lastReport = lastReportForProject(project.id);
          const isToday = lastReport?.date === todayISO;
          return (
            <Card
              key={project.id}
              className="glass-panel border-white/10 bg-white/5 text-white hover:border-white/20"
              onClick={() => setScreen({ key: "F2", projectId: project.id })}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{project.name}</p>
                  <p className="text-sm text-white/70">
                    Последний отчёт: {lastReport ? formatDate(lastReport.date) : "Нет отчётов"}
                  </p>
                </div>
                <Badge tone={isToday ? "success" : "danger"}>
                  {isToday ? "отчёт отправлен" : "нет отчёта"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {role === "foreman" ? (
        <div className="sticky bottom-4">
          <Button className="w-full bg-emerald-500 text-slate-950" onClick={() => handleStartReport()}>
            Создать отчёт
          </Button>
        </div>
      ) : null}
    </div>
  );

  const renderForemanReportsByProject = (project: Project) => {
    const reportsByProject = filteredReportsByProject(project.id);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white/70">
          <Button variant="ghost" className="text-white/70" onClick={resetToProjectList}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Назад
          </Button>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Объект: {project.name}</h2>
          <p className="text-sm text-white/60">Ваши отчёты по объекту</p>
        </div>
        <div className="space-y-3">
          {reportsByProject.map((report) => (
            <Card
              key={report.id}
              className="glass-panel border-white/10 bg-white/5 text-white hover:border-white/20"
              onClick={() => setScreen({ key: "F6", projectId: project.id, reportId: report.id })}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{formatDate(report.date)}</p>
                  <p className="text-sm text-white/70">Смена: {report.shift ? shiftLabels[report.shift] : "-"}</p>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>Видов работ: {report.works.length}</span>
                    {report.photos.length > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" /> {report.photos.length}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Badge tone="info">отправлен</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="sticky bottom-4">
          <Button className="w-full bg-emerald-500 text-slate-950" onClick={() => handleStartReport(project.id)}>
            Создать отчёт
          </Button>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Новый отчёт</h2>
        <p className="text-sm text-white/60">Шаг 1 из 3</p>
      </div>
      <SafeCard title="Объект">
        <Select
          value={draft.projectId}
          onValueChange={(value) => setDraft((prev) => ({ ...prev, projectId: value }))}
        >
          <SelectTrigger className="w-full border-white/20 bg-white/10 text-white">
            <SelectValue placeholder="Выберите объект" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 text-white">
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!draft.projectId && <p className="text-sm text-rose-200">Объект обязателен</p>}
      </SafeCard>

      <SafeCard title="Дата">
        <Input
          type="date"
          value={draft.date}
          onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
          className="border-white/20 bg-white/10 text-white"
        />
        {!draft.date && <p className="text-sm text-rose-200">Укажите дату</p>}
      </SafeCard>

      <SafeCard title="Смена">
        <div className="grid grid-cols-2 gap-2">
          {["day", "night"].map((shift) => (
            <Button
              key={shift}
              variant={draft.shift === shift ? "default" : "outline"}
              className={`w-full ${draft.shift === shift ? "bg-emerald-500 text-slate-950" : "border-white/20 text-white"}`}
              onClick={() => setDraft((prev) => ({ ...prev, shift: shift as Report["shift"] }))}
            >
              {shift === "day" ? "День" : "Ночь"}
            </Button>
          ))}
        </div>
      </SafeCard>

      <Button
        disabled={!step1Valid}
        className="w-full bg-emerald-500 text-slate-950 disabled:bg-white/20 disabled:text-white/60"
        onClick={() => setScreen({ key: "F4", projectId: draft.projectId })}
      >
        Далее
      </Button>
    </div>
  );

  const renderWorkItemCard = (item: WorkItem) => (
    <Card key={item.id} className="glass-panel border-white/10 bg-white/5 text-white">
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1 text-sm font-semibold text-white/80">Вид работ</div>
        <Select value={item.type} onValueChange={(value) => handleWorkChange(item.id, "type", value)}>
          <SelectTrigger className="border-white/20 bg-white/10 text-white">
            <SelectValue placeholder="Выберите вид работ" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 text-white">
            {workTypeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white/80">Объём за смену</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Введите значение"
              value={item.volume ?? ""}
              onChange={(e) => handleWorkChange(item.id, "volume", Number(e.target.value))}
              className="flex-1 border-white/20 bg-white/10 text-white"
            />
            <Select value={item.unit} onValueChange={(value) => handleWorkChange(item.id, "unit", value)}>
              <SelectTrigger className="w-24 border-white/20 bg-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 text-white">
                {unitOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white/80">% готовности по виду работ</p>
          <Input
            type="number"
            min={0}
            max={100}
            value={item.readinessPercent ?? 0}
            onChange={(e) => handleWorkChange(item.id, "readinessPercent", Number(e.target.value))}
            className="border-white/20 bg-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white/80">Комментарий</p>
          <Textarea
            placeholder="Особенности, замечания…"
            value={item.comment ?? ""}
            onChange={(e) => handleWorkChange(item.id, "comment", e.target.value)}
            className="min-h-[80px] border-white/20 bg-white/10 text-white"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Работы</h2>
          <p className="text-sm text-white/60">Шаг 2 из 3</p>
        </div>
        <Badge tone="info">{draft.works.length} позиций</Badge>
      </div>

      <div className="space-y-3">
        {draft.works.map((item) => renderWorkItemCard(item))}
      </div>

      <Button variant="ghost" className="text-white/80" onClick={handleAddWorkItem}>
        <Plus className="mr-2 h-4 w-4" /> Добавить ещё вид работ
      </Button>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="flex-1 border-white/30 text-white"
          onClick={() => setScreen({ key: "F3", projectId: draft.projectId })}
        >
          Назад
        </Button>
        <Button
          className="flex-1 bg-emerald-500 text-slate-950 disabled:bg-white/20 disabled:text-white/60"
          disabled={!step2Valid}
          onClick={() => setScreen({ key: "F5", projectId: draft.projectId })}
        >
          Далее
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Ресурсы и фото</h2>
        <p className="text-sm text-white/60">Шаг 3 из 3</p>
      </div>

      <SafeCard title="Люди">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70">Всего рабочих</span>
          <Input
            type="number"
            placeholder="0"
            value={draft.resources?.workersCount ?? ""}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                resources: { ...prev.resources, workersCount: Number(e.target.value) },
              }))
            }
            className="w-24 border-white/20 bg-white/10 text-white"
          />
          <span className="text-sm text-white/60">чел.</span>
        </div>
      </SafeCard>

      <SafeCard title="Техника">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70">Единиц техники</span>
          <Input
            type="number"
            placeholder="0"
            value={draft.resources?.machinesCount ?? ""}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                resources: { ...prev.resources, machinesCount: Number(e.target.value) },
              }))
            }
            className="w-24 border-white/20 bg-white/10 text-white"
          />
          <span className="text-sm text-white/60">ед.</span>
        </div>
      </SafeCard>

      <SafeCard title="Комментарий к смене">
        <Textarea
          placeholder="Кратко опишите выполненные работы, сложности, простои…"
          value={draft.comment ?? ""}
          onChange={(e) => setDraft((prev) => ({ ...prev, comment: e.target.value }))}
          className="min-h-[100px] border-white/20 bg-white/10 text-white"
        />
      </SafeCard>

      <SafeCard title="Фото">
        <div className="space-y-3">
          <p className="text-sm text-white/70">Перетащите фото или нажмите «Добавить»</p>
          <div className="grid grid-cols-3 gap-3">
            {draft.photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-xl border border-white/15 bg-white/5">
                <img src={photo.url} alt={photo.comment} className="h-24 w-full object-cover" />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 3 - draft.photos.length) }).map((_, idx) => (
              <div
                key={idx}
                className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-sm text-white/60"
              >
                Фото
              </div>
            ))}
          </div>
          <Button variant="outline" className="border-white/30 text-white" onClick={addPhotoPreview}>
            <ImageIcon className="mr-2 h-4 w-4" /> Добавить фото
          </Button>
        </div>
      </SafeCard>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="flex-1 border-white/30 text-white"
          onClick={() => setScreen({ key: "F4", projectId: draft.projectId })}
        >
          Назад
        </Button>
        <Button className="flex-1 bg-emerald-500 text-slate-950" onClick={goToPreview}>
          Просмотреть отчёт
        </Button>
      </div>
    </div>
  );

  const renderPreviewCard = (report: Report) => (
    <div className="space-y-4">
      <SafeCard title="Основное">
        <p>Объект: {projects.find((p) => p.id === report.projectId)?.name ?? "—"}</p>
        <p>Дата: {formatDate(report.date)}</p>
        <p>Смена: {report.shift ? shiftLabels[report.shift] : "—"}</p>
      </SafeCard>

      <SafeCard title="Работы">
        <div className="space-y-2 text-sm">
          {report.works.map((work) => (
            <div key={work.id} className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{work.type || "Без названия"}</span>
              {work.volume ? (
                <span className="text-white/70">
                  — {work.volume} {work.unit}
                </span>
              ) : null}
              {typeof work.readinessPercent === "number" ? (
                <Badge tone="info">{work.readinessPercent} %</Badge>
              ) : null}
            </div>
          ))}
        </div>
      </SafeCard>

      <SafeCard title="Ресурсы">
        <p>Люди: {report.resources?.workersCount ?? 0} чел.</p>
        <p>Техника: {report.resources?.machinesCount ?? 0} ед.</p>
      </SafeCard>

      <SafeCard title="Комментарий">
        <p className="text-white/80">{report.comment || "Без комментария"}</p>
      </SafeCard>

      <SafeCard title="Фото">
        <div className="flex gap-3 overflow-x-auto">
          {report.photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.comment}
              className="h-24 w-32 rounded-xl object-cover"
            />
          ))}
        </div>
      </SafeCard>
    </div>
  );

  const renderForemanPreview = (report: Report) => (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Предпросмотр</h2>
      </div>
      {renderPreviewCard(report)}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="flex-1 border-white/30 text-white"
          onClick={() => setScreen({ key: "F5", projectId: report.projectId })}
        >
          Назад, исправить
        </Button>
        {role === "foreman" ? (
          <Button className="flex-1 bg-emerald-500 text-slate-950" onClick={handleSubmitReport}>
            Отправить отчёт
          </Button>
        ) : null}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center gap-4 text-center text-white/90">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Отчёт отправлен</h2>
        <p className="text-sm text-white/70">Можно посмотреть его в списке отчётов.</p>
      </div>
      <Button className="w-full max-w-sm bg-emerald-500 text-slate-950" onClick={resetToProjectList}>
        К списку отчётов
      </Button>
    </div>
  );

  const renderManagerDashboard = () => {
    const filteredProjects = projects.filter((project) => {
      if (managerProjectFilter === "all") return true;
      return project.status === managerProjectFilter;
    });

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Объекты</h2>
        <div className="flex gap-2 overflow-x-auto">
          {[{ key: "all", label: "Все" }, { key: "on_track", label: "В срок" }, { key: "delayed", label: "Отстают" }].map(
            (chip) => (
              <Button
                key={chip.key}
                variant={managerProjectFilter === chip.key ? "default" : "outline"}
                className={`rounded-full border-white/20 ${
                  managerProjectFilter === chip.key ? "bg-emerald-500 text-slate-950" : "text-white"
                }`}
                onClick={() => setManagerProjectFilter(chip.key as typeof managerProjectFilter)}
              >
                {chip.label}
              </Button>
            )
          )}
        </div>

        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const lastReport = lastReportForProject(project.id);
            return (
              <Card
                key={project.id}
                className="glass-panel border-white/10 bg-white/5 text-white hover:border-white/20"
                onClick={() => setScreen({ key: "D2", projectId: project.id })}
              >
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">{project.name}</p>
                    {project.status ? (
                      <Badge tone={project.status === "delayed" ? "danger" : "info"}>
                        {statusLabels[project.status]}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-white/70">Готовность: {project.readinessPercent ?? 0} %</p>
                  <p className="text-sm text-white/70">
                    Последний отчёт: {lastReport ? formatDate(lastReport.date) : "Нет отчётов"}
                  </p>
                  <p className="text-xs text-white/50">Прораб: {project.foremanName ?? "—"}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderManagerReports = (project: Project) => {
    const reportsForProject = managerReportFilters(project.id, managerReportsFilter);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-white/70" onClick={resetToProjectList}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Назад
          </Button>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <p className="text-sm text-white/60">История отчётов</p>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {["week", "month", "all", "problems"].map((key) => (
            <Button
              key={key}
              variant={managerReportsFilter === key ? "default" : "outline"}
              className={`rounded-full border-white/20 ${
                managerReportsFilter === key ? "bg-emerald-500 text-slate-950" : "text-white"
              }`}
              onClick={() => setManagerReportsFilter(key as typeof managerReportsFilter)}
            >
              {key === "week" ? "Неделя" : key === "month" ? "Месяц" : key === "all" ? "Все" : "Только с проблемами"}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {reportsForProject.map((report) => (
            <Card
              key={report.id}
              className="glass-panel border-white/10 bg-white/5 text-white hover:border-white/20"
              onClick={() => setScreen({ key: "D3", projectId: project.id, reportId: report.id })}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{formatDate(report.date)}</p>
                  <p className="text-sm text-white/70">Смена: {report.shift ? shiftLabels[report.shift] : "—"}</p>
                  <p className="text-xs text-white/60">
                    Видов работ: {report.works.length}, фото: {report.photos.length}
                  </p>
                </div>
                <Badge tone={report.hasProblems ? "danger" : "success"}>
                  {report.hasProblems ? "есть проблемы" : "без проблем"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderManagerReportCard = (report: Report, project: Project) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="text-white/70"
          onClick={() => setScreen({ key: "D2", projectId: project.id })}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Назад к отчётам
        </Button>
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Отчёт от {formatDate(report.date)}</h2>
        <p className="text-sm text-white/60">{project.name}</p>
      </div>

      <SafeCard title="Сводка">
        <p>Прораб: {report.foremanName ?? project.foremanName ?? "—"}</p>
        <p>Смена: {report.shift ? shiftLabels[report.shift] : "—"}</p>
        <p>Люди: {report.resources?.workersCount ?? 0} чел.</p>
        <p>Техника: {report.resources?.machinesCount ?? 0} ед.</p>
        <p>Оценка готовности по объекту: {report.objectReadinessPercent ?? project.readinessPercent ?? 0} %</p>
      </SafeCard>

      <SafeCard title="Выполненные работы">
        <div className="space-y-2">
          {report.works.map((work) => (
            <div key={work.id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{work.type}</span>
              <span className="text-white/70">— {work.volume ?? 0} {work.unit}</span>
              {typeof work.readinessPercent === "number" ? (
                <Badge tone="info">{work.readinessPercent} %</Badge>
              ) : null}
            </div>
          ))}
        </div>
      </SafeCard>

      <SafeCard title="Комментарий прораба">
        <div className="space-y-2">
          {report.hasProblems ? <Badge tone="danger">Есть проблемы</Badge> : null}
          <p className="text-white/80">{report.comment || "Комментариев нет"}</p>
        </div>
      </SafeCard>

      <SafeCard title="Фото с объекта">
        <div className="flex gap-3 overflow-x-auto">
          {report.photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.comment}
              className="h-24 w-32 rounded-xl object-cover"
            />
          ))}
        </div>
      </SafeCard>
    </div>
  );

  const renderAnalytics = (project: Project) => {
    const reportsForProject = filteredReportsByProject(project.id);
    const problemReports = reportsForProject.filter((r) => r.hasProblems);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-white/70"
            onClick={() => setScreen({ key: "D2", projectId: project.id })}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> К объекту
          </Button>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Аналитика</h2>
          <p className="text-sm text-white/60">{project.name}</p>
        </div>

        <SafeCard title="Готовность объекта">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full border-4 border-emerald-400/60 grid place-items-center text-lg font-semibold">
              {project.readinessPercent ?? 0}%
            </div>
            <div className="text-sm text-white/80">
              <p>Текущая готовность: {project.readinessPercent ?? 0} %</p>
              <p className="text-emerald-200">Изменение за 30 дней: +12 %</p>
            </div>
          </div>
        </SafeCard>

        <SafeCard title="Отчёты за период">
          <p>Отчётов за 30 дней: {reportsForProject.length}</p>
          <p>Дней без отчёта: 2</p>
        </SafeCard>

        <SafeCard title="Проблемы">
          <p>Отчётов с проблемами: {problemReports.length}</p>
          <p>
            Последний проблемный отчёт: {problemReports[0]?.date ? formatDate(problemReports[0].date) : "—"}
          </p>
        </SafeCard>
      </div>
    );
  };

  const renderContent = () => {
    if (role === "foreman") {
      if (screen.key === "F1") return renderForemanHome();
      if (screen.key === "F2" && screen.projectId) {
        const project = projects.find((p) => p.id === screen.projectId);
        return project ? renderForemanReportsByProject(project) : null;
      }
      if (screen.key === "F3") return renderStep1();
      if (screen.key === "F4") return renderStep2();
      if (screen.key === "F5") return renderStep3();
      if (screen.key === "F6") {
        if (screen.reportId) {
          const report = reports.find((r) => r.id === screen.reportId);
          return report ? renderForemanPreview(report) : null;
        }
        return renderForemanPreview(draft);
      }
      if (screen.key === "F7") return renderSuccess();
    }

    if (role === "manager") {
      if (screen.key === "D1") return renderManagerDashboard();
      if (screen.key === "D2" && screen.projectId) {
        const project = projects.find((p) => p.id === screen.projectId);
        return project ? (
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-2 border-white/20 bg-white/5 text-white">
              <TabsTrigger value="reports">Отчёты</TabsTrigger>
              <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            </TabsList>
            <TabsContent value="reports">{renderManagerReports(project)}</TabsContent>
            <TabsContent value="analytics">{renderAnalytics(project)}</TabsContent>
          </Tabs>
        ) : null;
      }
      if (screen.key === "D3" && screen.projectId && screen.reportId) {
        const project = projects.find((p) => p.id === screen.projectId);
        const report = reports.find((r) => r.id === screen.reportId);
        return project && report ? renderManagerReportCard(report, project) : null;
      }
      if (screen.key === "D4" && screen.projectId) {
        const project = projects.find((p) => p.id === screen.projectId);
        return project ? renderAnalytics(project) : null;
      }
    }

    return null;
  };

  return (
    <div className="safe-area-page mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
      <div className="glass-panel border-white/10 bg-white/5 p-4 shadow-xl">
        {renderHeader()}
        {renderContent()}
      </div>
    </div>
  );
}
