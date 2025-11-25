import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

export type Role = "foreman" | "manager";

export interface Project {
  id: string;
  name: string;
  address?: string;
  lastReportDate?: string;
  readinessPercent?: number;
  status?: "on_track" | "delayed" | "no_reports";
  foremanName?: string;
}

export interface WorkItem {
  id: string;
  type: string;
  volume?: number;
  unit?: string;
  readinessPercent?: number;
  comment?: string;
}

export interface Resources {
  workersCount?: number;
  machinesCount?: number;
}

export interface ReportPhoto {
  id: string;
  url: string;
  comment?: string;
}

export interface Report {
  id: string;
  projectId: string;
  date: string;
  shift?: "day" | "night";
  weather?: string;
  works: WorkItem[];
  resources?: Resources;
  comment?: string;
  photos: ReportPhoto[];
  foremanName?: string;
  objectReadinessPercent?: number;
  hasProblems?: boolean;
}

type ScreenState =
  | { key: "foreman-home" }
  | { key: "foreman-project"; projectId: string }
  | { key: "foreman-step1" }
  | { key: "foreman-step2" }
  | { key: "foreman-step3" }
  | { key: "foreman-preview" }
  | { key: "foreman-success"; projectId: string }
  | { key: "foreman-view"; projectId: string; reportId: string }
  | { key: "manager-dashboard" }
  | { key: "manager-project"; projectId: string }
  | { key: "manager-report"; projectId: string; reportId: string }
  | { key: "manager-analytics"; projectId: string };

const workTypeOptions = [
  "Бетонирование перекрытий",
  "Армирование",
  "Кладка",
  "Отделка",
  "Инженерные сети",
  "Другое",
];

const unitOptions = ["м³", "м²", "шт", "пог.м"];

const samplePhotos = [
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=60",
  "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=400&q=60",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=60",
];

const initialProjects: Project[] = [
  {
    id: "1",
    name: "ЖК «Северный»",
    address: "ул. Строителей, 12",
    lastReportDate: "2025-11-24",
    readinessPercent: 75,
    status: "on_track",
    foremanName: "Иванов И.",
  },
  {
    id: "2",
    name: "ТЦ «Галактика»",
    address: "пр. Мира, 4",
    lastReportDate: "2025-11-22",
    readinessPercent: 62,
    status: "delayed",
    foremanName: "Петров П.",
  },
];

const initialReports: Record<string, Report[]> = {
  "1": [
    {
      id: "r1",
      projectId: "1",
      date: "2025-11-24",
      shift: "day",
      works: [
        {
          id: "w1",
          type: "Бетонирование перекрытий",
          volume: 12.5,
          unit: "м³",
          readinessPercent: 76,
          comment: "Работаем без простоев",
        },
        {
          id: "w2",
          type: "Армирование",
          volume: 45,
          unit: "м²",
          readinessPercent: 60,
          comment: "Требуются доп. материалы",
        },
      ],
      resources: { workersCount: 15, machinesCount: 3 },
      comment: "В целом всё по плану. Погодные условия благоприятные.",
      photos: [
        { id: "p1", url: samplePhotos[0], comment: "Вид перекрытий" },
        { id: "p2", url: samplePhotos[1], comment: "Арматурный каркас" },
      ],
      foremanName: "Иванов И.",
      objectReadinessPercent: 75,
      hasProblems: false,
    },
    {
      id: "r2",
      projectId: "1",
      date: "2025-11-23",
      shift: "night",
      works: [
        {
          id: "w3",
          type: "Кладка",
          volume: 30,
          unit: "м²",
          readinessPercent: 55,
          comment: "",
        },
      ],
      resources: { workersCount: 12, machinesCount: 2 },
      comment: "Небольшое отставание из-за поставок.",
      photos: [],
      foremanName: "Иванов И.",
      objectReadinessPercent: 73,
      hasProblems: true,
    },
  ],
  "2": [
    {
      id: "r3",
      projectId: "2",
      date: "2025-11-22",
      shift: "day",
      works: [
        {
          id: "w4",
          type: "Отделка",
          volume: 80,
          unit: "м²",
          readinessPercent: 68,
          comment: "Замена поставщика материалов",
        },
      ],
      resources: { workersCount: 10, machinesCount: 2 },
      comment: "Работаем в штатном режиме.",
      photos: [{ id: "p3", url: samplePhotos[2] }],
      foremanName: "Петров П.",
      objectReadinessPercent: 62,
      hasProblems: false,
    },
  ],
};

function formatDate(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("ru-RU");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function hasReportForToday(list: Report[]) {
  return list.some((r) => r.date === todayISO());
}

let idCounter = 100;
function createId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export default function App() {
  const roleFromQuery = useMemo(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const role = qs.get("role");
      return role === "manager" ? "manager" : "foreman";
    } catch (error) {
      return "foreman" as Role;
    }
  }, []);

  const [role, setRole] = useState<Role>(roleFromQuery);
  const [screen, setScreen] = useState<ScreenState>(() =>
    roleFromQuery === "manager"
      ? { key: "manager-dashboard" }
      : { key: "foreman-home" }
  );

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [reports, setReports] = useState<Record<string, Report[]>>(initialReports);
  const [managerProjectFilter, setManagerProjectFilter] = useState<
    "all" | "on_track" | "delayed"
  >("all");
  const [managerReportFilter, setManagerReportFilter] = useState<
    "week" | "month" | "all" | "problems"
  >("all");

  const [newReportDraft, setNewReportDraft] = useState<Report>(() => ({
    id: "draft",
    projectId: initialProjects[0]?.id ?? "",
    date: todayISO(),
    shift: "day",
    works: [
      {
        id: createId("work"),
        type: "Бетонирование перекрытий",
        volume: undefined,
        unit: unitOptions[0],
        readinessPercent: 50,
        comment: "",
      },
    ],
    resources: { workersCount: undefined, machinesCount: undefined },
    comment: "",
    photos: [],
    foremanName: "Иванов И.",
    objectReadinessPercent: 70,
    hasProblems: false,
  }));

  useEffect(() => {
    if (role === "manager") {
      setScreen({ key: "manager-dashboard" });
      setManagerProjectFilter("all");
      setManagerReportFilter("all");
    } else {
      setScreen({ key: "foreman-home" });
    }
  }, [role]);

  useEffect(() => {
    const isForemanScreen = screen.key.startsWith("foreman-");
    const isManagerScreen = screen.key.startsWith("manager-");

    if (role === "manager" && isForemanScreen) {
      setScreen({ key: "manager-dashboard" });
    }

    if (role === "foreman" && isManagerScreen) {
      setScreen({ key: "foreman-home" });
    }
  }, [role, screen.key]);

  const selectedProjectId = useMemo(() => {
    if (screen.key === "foreman-project" || screen.key === "foreman-success") {
      return screen.projectId;
    }
    if (screen.key === "manager-project" || screen.key === "manager-report" || screen.key === "manager-analytics") {
      return screen.projectId;
    }
    if (screen.key === "foreman-step1" || screen.key === "foreman-step2" || screen.key === "foreman-step3" || screen.key === "foreman-preview") {
      return newReportDraft.projectId;
    }
    return projects[0]?.id ?? "";
  }, [newReportDraft.projectId, projects, screen]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const step1Errors: Record<string, string> = {};
  if (!newReportDraft.projectId) step1Errors.projectId = "Выберите объект";
  if (!newReportDraft.date) step1Errors.date = "Укажите дату";

  const step2Valid = newReportDraft.works.some(
    (w) => w.type && w.volume !== undefined && w.volume !== null && w.volume !== ""
  );

  const reportsForProject = (projectId: string) => reports[projectId] ?? [];

  const handleCreateReportFromProject = (projectId: string) => {
    if (role !== "foreman") return;

    setNewReportDraft({
      ...newReportDraft,
      projectId,
      date: todayISO(),
    });
    setScreen({ key: "foreman-step1" });
  };

  const addWorkItem = () => {
    setNewReportDraft((prev) => ({
      ...prev,
      works: [
        ...prev.works,
        {
          id: createId("work"),
          type: "",
          volume: undefined,
          unit: unitOptions[0],
          readinessPercent: 50,
          comment: "",
        },
      ],
    }));
  };

  const updateWorkItem = (id: string, patch: Partial<WorkItem>) => {
    setNewReportDraft((prev) => ({
      ...prev,
      works: prev.works.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }));
  };

  const removeWorkItem = (id: string) => {
    setNewReportDraft((prev) => ({
      ...prev,
      works: prev.works.length > 1 ? prev.works.filter((w) => w.id !== id) : prev.works,
    }));
  };

  const addPhoto = () => {
    const url = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setNewReportDraft((prev) => ({
      ...prev,
      photos: [...prev.photos, { id: createId("photo"), url }],
    }));
  };

  const resetDraft = () => {
    setNewReportDraft({
      id: "draft",
      projectId: selectedProjectId,
      date: todayISO(),
      shift: "day",
      works: [
        {
          id: createId("work"),
          type: "Бетонирование перекрытий",
          volume: undefined,
          unit: unitOptions[0],
          readinessPercent: 50,
          comment: "",
        },
      ],
      resources: { workersCount: undefined, machinesCount: undefined },
      comment: "",
      photos: [],
      foremanName: selectedProject?.foremanName ?? "Иванов И.",
      objectReadinessPercent: selectedProject?.readinessPercent ?? 70,
      hasProblems: false,
    });
  };

  const submitReport = () => {
    if (!step2Valid || Object.keys(step1Errors).length > 0) return;
    const newReport: Report = {
      ...newReportDraft,
      id: createId("report"),
      date: newReportDraft.date,
      projectId: newReportDraft.projectId,
      hasProblems: newReportDraft.comment?.toLowerCase().includes("проблем") ?? false,
    };

    setReports((prev) => ({
      ...prev,
      [newReport.projectId]: [newReport, ...(prev[newReport.projectId] ?? [])],
    }));

    setProjects((prev) =>
      prev.map((p) =>
        p.id === newReport.projectId
          ? { ...p, lastReportDate: newReport.date, readinessPercent: newReport.objectReadinessPercent }
          : p
      )
    );

    setScreen({ key: "foreman-success", projectId: newReport.projectId });
    resetDraft();
  };

  const renderBadge = (label: string, tone: "positive" | "negative" | "neutral") => (
    <span className={`badge badge-${tone}`}>{label}</span>
  );

  const renderCardHeader = (title: string, subtitle?: string) => (
    <div className="card-header">
      <div>
        <div className="card-title">{title}</div>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  const renderWorkRow = (work: WorkItem) => (
    <div key={work.id} className="preview-row">
      <div className="preview-title">{work.type || "Вид работ"}</div>
      <div className="preview-subtitle">
        {work.volume ?? "—"} {work.unit || ""} — {work.readinessPercent ?? 0} %
      </div>
      {work.comment && <div className="preview-comment">{work.comment}</div>}
    </div>
  );

  const renderForemanHome = () => (
    <div className="page">
      <div className="page-header">
        <div className="greeting-title">Добрый день, Иван</div>
        <div className="greeting-subtitle">Объекты под вашим контролем</div>
      </div>
      <div className="cards-grid">
        {projects.map((project) => {
          const projectReports = reportsForProject(project.id);
          const statusBadge = hasReportForToday(projectReports)
            ? renderBadge("отчёт отправлен", "positive")
            : renderBadge("нет отчёта", "negative");

          return (
            <div
              key={project.id}
              className="card interactive"
              onClick={() => setScreen({ key: "foreman-project", projectId: project.id })}
            >
              <div className="card-row">
                <div>
                  <div className="card-title">{project.name}</div>
                  <div className="card-subtitle">
                    {project.lastReportDate
                      ? `Последний отчёт: ${formatDate(project.lastReportDate)}`
                      : "Нет отчётов"}
                  </div>
                </div>
                {statusBadge}
              </div>
            </div>
          );
        })}
      </div>
      <div className="floating-actions">
        <button className="primary" onClick={() => handleCreateReportFromProject(selectedProjectId)}>
          Создать отчёт
        </button>
      </div>
    </div>
  );

  const renderForemanProjectReports = (projectId: string) => {
    const list = reportsForProject(projectId);
    const project = projects.find((p) => p.id === projectId);

    return (
      <div className="page">
        {renderCardHeader(`Объект: ${project?.name ?? "Объект"}`, "Ваши отчёты по объекту")}

        <div className="cards-grid">
          {list.map((report) => (
            <div
              key={report.id}
              className="card interactive"
              onClick={() =>
                setScreen({ key: "foreman-view", projectId, reportId: report.id })
              }
            >
              <div className="card-row between">
                <div className="big-date">{formatDate(report.date)}</div>
                {renderBadge("отправлен", "positive")}
              </div>
              <div className="card-subtitle">Смена: {report.shift === "night" ? "Ночь" : "День"}</div>
              <div className="card-row muted">
                <span>Видов работ: {report.works.length}</span>
                {report.photos.length > 0 && <span>Фото: {report.photos.length}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="floating-actions">
          <button className="primary" onClick={() => handleCreateReportFromProject(projectId)}>
            Создать отчёт
          </button>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="page">
      {renderCardHeader("Новый отчёт", "Шаг 1 из 3")}
      <div className="card">
        <label className="field-label">Объект</label>
        <select
          className={`field-input ${step1Errors.projectId ? "field-error" : ""}`}
          value={newReportDraft.projectId}
          onChange={(e) =>
            setNewReportDraft({
              ...newReportDraft,
              projectId: e.target.value,
            })
          }
        >
          <option value="">Выберите объект</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {step1Errors.projectId && <div className="error-text">{step1Errors.projectId}</div>}
      </div>

      <div className="card">
        <label className="field-label">Дата</label>
        <input
          type="date"
          className={`field-input ${step1Errors.date ? "field-error" : ""}`}
          value={newReportDraft.date}
          onChange={(e) =>
            setNewReportDraft({
              ...newReportDraft,
              date: e.target.value,
            })
          }
        />
        {step1Errors.date && <div className="error-text">{step1Errors.date}</div>}
      </div>

      <div className="card">
        <label className="field-label">Смена</label>
        <div className="segmented">
          <button
            className={newReportDraft.shift === "day" ? "segment active" : "segment"}
            onClick={() => setNewReportDraft({ ...newReportDraft, shift: "day" })}
          >
            День
          </button>
          <button
            className={newReportDraft.shift === "night" ? "segment active" : "segment"}
            onClick={() => setNewReportDraft({ ...newReportDraft, shift: "night" })}
          >
            Ночь
          </button>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="primary"
          onClick={() => setScreen({ key: "foreman-step2" })}
          disabled={Object.keys(step1Errors).length > 0}
        >
          Далее
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="page">
      {renderCardHeader("Работы", "Шаг 2 из 3")}
      <div className="stack">
        {newReportDraft.works.map((work, index) => (
          <div key={work.id} className="card">
            <div className="card-row between">
              <span className="field-label">Вид работ</span>
              {newReportDraft.works.length > 1 && (
                <button className="text-button" onClick={() => removeWorkItem(work.id)}>
                  Удалить
                </button>
              )}
            </div>
            <select
              className="field-input"
              value={work.type}
              onChange={(e) => updateWorkItem(work.id, { type: e.target.value })}
            >
              <option value="">Выберите вид работ</option>
              {workTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="field-label">Объём за смену</label>
            <div className="inline-inputs">
              <input
                type="number"
                className="field-input"
                placeholder="Введите значение"
                value={work.volume ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateWorkItem(work.id, {
                    volume: value === "" ? undefined : Number(value),
                  });
                }}
              />
              <select
                className="field-input unit-input"
                value={work.unit}
                onChange={(e) => updateWorkItem(work.id, { unit: e.target.value })}
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <label className="field-label">% готовности по виду работ</label>
            <input
              type="range"
              min={0}
              max={100}
              value={work.readinessPercent ?? 0}
              onChange={(e) => updateWorkItem(work.id, { readinessPercent: Number(e.target.value) })}
            />
            <div className="range-value">{work.readinessPercent ?? 0} %</div>

            <label className="field-label">Комментарий</label>
            <textarea
              className="field-input"
              placeholder="Особенности, замечания…"
              value={work.comment}
              onChange={(e) => updateWorkItem(work.id, { comment: e.target.value })}
            />
          </div>
        ))}
      </div>

      <button className="text-button" onClick={addWorkItem}>
        + Добавить ещё вид работ
      </button>

      <div className="form-actions split">
        <button className="secondary" onClick={() => setScreen({ key: "foreman-step1" })}>
          Назад
        </button>
        <button className="primary" onClick={() => setScreen({ key: "foreman-step3" })} disabled={!step2Valid}>
          Далее
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="page">
      {renderCardHeader("Ресурсы и фото", "Шаг 3 из 3")}
      <div className="card">
        <div className="card-title small">Люди</div>
        <label className="field-label">Всего рабочих</label>
        <div className="inline-inputs">
          <input
            type="number"
            className="field-input"
            placeholder="0"
            value={newReportDraft.resources?.workersCount ?? ""}
            onChange={(e) =>
              setNewReportDraft({
                ...newReportDraft,
                resources: {
                  ...newReportDraft.resources,
                  workersCount:
                    e.target.value === "" ? undefined : Number(e.target.value),
                },
              })
            }
          />
          <span className="unit">чел.</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title small">Техника</div>
        <label className="field-label">Единиц техники</label>
        <div className="inline-inputs">
          <input
            type="number"
            className="field-input"
            placeholder="0"
            value={newReportDraft.resources?.machinesCount ?? ""}
            onChange={(e) =>
              setNewReportDraft({
                ...newReportDraft,
                resources: {
                  ...newReportDraft.resources,
                  machinesCount:
                    e.target.value === "" ? undefined : Number(e.target.value),
                },
              })
            }
          />
          <span className="unit">ед.</span>
        </div>
      </div>

      <div className="card">
        <label className="field-label">Комментарий к смене</label>
        <textarea
          className="field-input"
          placeholder="Кратко опишите выполненные работы, сложности, простои…"
          value={newReportDraft.comment}
          onChange={(e) => setNewReportDraft({ ...newReportDraft, comment: e.target.value })}
        />
      </div>

      <div className="card dashed">
        <div className="card-title small">Фото</div>
        <div className="card-subtitle">Перетащите фото или нажмите «Добавить»</div>
        <div className="photo-grid">
          {newReportDraft.photos.length === 0 && <div className="photo-placeholder">Фото</div>}
          {newReportDraft.photos.map((photo) => (
            <div key={photo.id} className="photo-thumb">
              <img src={photo.url} alt="Фото отчёта" />
            </div>
          ))}
        </div>
        <button className="secondary" onClick={addPhoto}>
          Добавить фото
        </button>
      </div>

      <div className="form-actions split">
        <button className="secondary" onClick={() => setScreen({ key: "foreman-step2" })}>
          Назад
        </button>
        <button className="primary" onClick={() => setScreen({ key: "foreman-preview" })}>
          Просмотреть отчёт
        </button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="page">
      {renderCardHeader("Предпросмотр")}
      <div className="card">
        <div className="card-title small">Основное</div>
        <div className="preview-row">Объект: {selectedProject?.name ?? "—"}</div>
        <div className="preview-row">Дата: {formatDate(newReportDraft.date)}</div>
        <div className="preview-row">Смена: {newReportDraft.shift === "night" ? "Ночь" : "День"}</div>
      </div>

      <div className="card">
        <div className="card-title small">Работы</div>
        {newReportDraft.works.map(renderWorkRow)}
      </div>

      <div className="card">
        <div className="card-title small">Ресурсы</div>
        <div className="preview-row">
          Люди: {newReportDraft.resources?.workersCount ?? 0} чел.
        </div>
        <div className="preview-row">
          Техника: {newReportDraft.resources?.machinesCount ?? 0} ед.
        </div>
      </div>

      <div className="card">
        <div className="card-title small">Комментарий</div>
        <div className="preview-row">{newReportDraft.comment || "Без комментариев"}</div>
      </div>

      <div className="card">
        <div className="card-title small">Фото</div>
        <div className="photo-row">
          {newReportDraft.photos.length === 0 && <div className="photo-placeholder">Фото</div>}
          {newReportDraft.photos.map((photo) => (
            <div key={photo.id} className="photo-thumb">
              <img src={photo.url} alt="Фото" />
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions split">
        <button className="secondary" onClick={() => setScreen({ key: "foreman-step3" })}>
          Назад, исправить
        </button>
        <button className="primary" onClick={submitReport}>
          Отправить отчёт
        </button>
      </div>
    </div>
  );

  const renderForemanReportView = (projectId: string, reportId: string) => {
    const report = reportsForProject(projectId).find((r) => r.id === reportId);
    const project = projects.find((p) => p.id === projectId);

    if (!report) return null;

    return (
      <div className="page">
        {renderCardHeader("Предпросмотр", project?.name ?? "Объект")}
        <div className="card">
          <div className="card-title small">Основное</div>
          <div className="preview-row">Дата: {formatDate(report.date)}</div>
          <div className="preview-row">Смена: {report.shift === "night" ? "Ночь" : "День"}</div>
        </div>

        <div className="card">
          <div className="card-title small">Работы</div>
          {report.works.map(renderWorkRow)}
        </div>

        <div className="card">
          <div className="card-title small">Ресурсы</div>
          <div className="preview-row">Люди: {report.resources?.workersCount ?? 0} чел.</div>
          <div className="preview-row">Техника: {report.resources?.machinesCount ?? 0} ед.</div>
        </div>

        <div className="card">
          <div className="card-title small">Комментарий</div>
          <div className="preview-row">{report.comment || "Без комментариев"}</div>
        </div>

        <div className="card">
          <div className="card-title small">Фото</div>
          <div className="photo-row">
            {report.photos.map((photo) => (
              <div key={photo.id} className="photo-thumb">
                <img src={photo.url} alt="Фото" />
              </div>
            ))}
            {report.photos.length === 0 && <div className="photo-placeholder">Фото</div>}
          </div>
        </div>

        <div className="form-actions">
          <button
            className="secondary"
            onClick={() => setScreen({ key: "foreman-project", projectId })}
          >
            Назад
          </button>
        </div>
      </div>
    );
  };

  const renderSuccess = (projectId: string) => (
    <div className="page center">
      <div className="success-icon">✔</div>
      <div className="greeting-title">Отчёт отправлен</div>
      <div className="greeting-subtitle">Можно посмотреть его в списке отчётов.</div>
      <div className="form-actions">
        <button
          className="primary"
          onClick={() => setScreen({ key: "foreman-project", projectId })}
        >
          К списку отчётов
        </button>
      </div>
    </div>
  );

  const renderManagerDashboard = () => {
    const filtered = projects.filter((p) => {
      if (managerProjectFilter === "all") return true;
      return p.status === (managerProjectFilter === "on_track" ? "on_track" : "delayed");
    });

    return (
      <div className="page">
        {renderCardHeader("Объекты")}
        <div className="chip-row">
          <button
            className={managerProjectFilter === "all" ? "chip active" : "chip"}
            onClick={() => setManagerProjectFilter("all")}
          >
            Все
          </button>
          <button
            className={managerProjectFilter === "on_track" ? "chip active" : "chip"}
            onClick={() => setManagerProjectFilter("on_track")}
          >
            В срок
          </button>
          <button
            className={managerProjectFilter === "delayed" ? "chip active" : "chip"}
            onClick={() => setManagerProjectFilter("delayed")}
          >
            Отстают
          </button>
        </div>

        <div className="cards-grid">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="card interactive"
              onClick={() => {
                setManagerReportFilter("all");
                setScreen({ key: "manager-project", projectId: project.id });
              }}
            >
              <div className="card-row between">
                <div className="card-title">{project.name}</div>
                {renderBadge(project.status === "on_track" ? "в срок" : "отставание", project.status === "on_track" ? "positive" : "negative")}
              </div>
              <div className="card-subtitle">Готовность: {project.readinessPercent ?? 0} %</div>
              <div className="card-subtitle">Последний отчёт: {formatDate(project.lastReportDate)}</div>
              <div className="card-subtitle small">Прораб: {project.foremanName}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderManagerProjectReports = (projectId: string) => {
    const list = reportsForProject(projectId);
    const filtered = list.filter((report) => {
      if (managerReportFilter === "problems") return report.hasProblems;

      if (managerReportFilter === "week") {
        const diffDays =
          (Date.now() - new Date(report.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }

      if (managerReportFilter === "month") {
        const diffDays =
          (Date.now() - new Date(report.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }

      return true;
    });
    const project = projects.find((p) => p.id === projectId);

    return (
      <div className="page">
        {renderCardHeader(project?.name ?? "Объект", "История отчётов")}
        <div className="chip-row">
          {[
            { key: "week", label: "Неделя" },
            { key: "month", label: "Месяц" },
            { key: "all", label: "Все" },
            { key: "problems", label: "Только с проблемами" },
          ].map((item) => (
            <button
              key={item.key}
              className={managerReportFilter === item.key ? "chip active" : "chip"}
              onClick={() => setManagerReportFilter(item.key as typeof managerReportFilter)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="cards-grid">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="card interactive"
              onClick={() => setScreen({ key: "manager-report", projectId, reportId: report.id })}
            >
              <div className="card-row between">
                <div className="big-date">{formatDate(report.date)}</div>
                {renderBadge(report.hasProblems ? "есть проблемы" : "без проблем", report.hasProblems ? "negative" : "positive")}
              </div>
              <div className="card-subtitle">Смена: {report.shift === "night" ? "Ночь" : "День"}</div>
              <div className="card-subtitle">Видов работ: {report.works.length}, фото: {report.photos.length}</div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="secondary" onClick={() => setScreen({ key: "manager-dashboard" })}>
            Назад
          </button>
          <button className="primary" onClick={() => setScreen({ key: "manager-analytics", projectId })}>
            Аналитика
          </button>
        </div>
      </div>
    );
  };

  const renderManagerReport = (projectId: string, reportId: string) => {
    const report = reportsForProject(projectId).find((r) => r.id === reportId);
    const project = projects.find((p) => p.id === projectId);

    if (!report) return null;

    return (
      <div className="page">
        {renderCardHeader(`Отчёт от ${formatDate(report.date)}`, project?.name)}

        <div className="card">
          <div className="card-title small">Сводка</div>
          <div className="preview-row">Прораб: {report.foremanName ?? "—"}</div>
          <div className="preview-row">Смена: {report.shift === "night" ? "Ночь" : "День"}</div>
          <div className="preview-row">Люди: {report.resources?.workersCount ?? 0} чел.</div>
          <div className="preview-row">Техника: {report.resources?.machinesCount ?? 0} ед.</div>
          <div className="preview-row">
            Оценка готовности по объекту: {report.objectReadinessPercent ?? 0} %
          </div>
        </div>

        <div className="card">
          <div className="card-title small">Выполненные работы</div>
          {report.works.map(renderWorkRow)}
        </div>

        <div className="card">
          <div className="card-row between">
            <div className="card-title small">Комментарий прораба</div>
            {report.hasProblems && renderBadge("Есть проблемы", "negative")}
          </div>
          <div className="preview-row">{report.comment || "Без комментариев"}</div>
        </div>

        <div className="card">
          <div className="card-title small">Фото с объекта</div>
          <div className="photo-row">
            {report.photos.map((photo) => (
              <div key={photo.id} className="photo-thumb">
                <img src={photo.url} alt="Фото" />
              </div>
            ))}
            {report.photos.length === 0 && <div className="photo-placeholder">Нет фото</div>}
          </div>
        </div>

        <div className="form-actions">
          <button className="primary" onClick={() => setScreen({ key: "manager-project", projectId })}>
            Назад к отчётам
          </button>
        </div>
      </div>
    );
  };

  const renderManagerAnalytics = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const list = reportsForProject(projectId);
    const withProblems = list.filter((r) => r.hasProblems);

    return (
      <div className="page">
        {renderCardHeader("Аналитика", project?.name)}

        <div className="card">
          <div className="card-title small">Готовность объекта</div>
          <div className="analytics-row">
            <div className="progress-circle">{project?.readinessPercent ?? 0}%</div>
            <div>
              <div className="preview-row">Текущая готовность: {project?.readinessPercent ?? 0} %</div>
              <div className="preview-row">Изменение за 30 дней: +12 %</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title small">Отчёты за период</div>
          <div className="preview-row">Отчётов за 30 дней: {list.length}</div>
          <div className="preview-row">Дней без отчёта: 2</div>
        </div>

        <div className="card">
          <div className="card-title small">Проблемы</div>
          <div className="preview-row">Отчётов с проблемами: {withProblems.length}</div>
          <div className="preview-row">
            Последний проблемный отчёт: {withProblems[0] ? formatDate(withProblems[0].date) : "—"}
          </div>
        </div>

        <div className="form-actions">
          <button className="primary" onClick={() => setScreen({ key: "manager-project", projectId })}>
            К объекту
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (screen.key) {
      case "foreman-home":
        return renderForemanHome();
      case "foreman-project":
        return renderForemanProjectReports(screen.projectId);
      case "foreman-step1":
        return renderStep1();
      case "foreman-step2":
        return renderStep2();
      case "foreman-step3":
        return renderStep3();
      case "foreman-preview":
        return renderPreview();
      case "foreman-success":
        return renderSuccess(screen.projectId);
      case "foreman-view":
        return renderForemanReportView(screen.projectId, screen.reportId);
      case "manager-dashboard":
        return renderManagerDashboard();
      case "manager-project":
        return renderManagerProjectReports(screen.projectId);
      case "manager-report":
        return renderManagerReport(screen.projectId, screen.reportId);
      case "manager-analytics":
        return renderManagerAnalytics(screen.projectId);
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <div className="role-switcher">
        <button
          className={role === "foreman" ? "chip active" : "chip"}
          onClick={() => setRole("foreman")}
        >
          Роль: прораб
        </button>
        <button
          className={role === "manager" ? "chip active" : "chip"}
          onClick={() => setRole("manager")}
        >
          Роль: руководитель
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
