// src/App.tsx
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  CorporateStrictLayout,
  GlassmorphismLayout,
  MinimalistLayout,
} from "@/components/LayoutVariants";
import {
  ContractorHomeScreen,
  ContractorObject,
} from "@/components/ContractorHomeScreen";
import { DashboardScreen } from "@/components/DashboardScreen";
import { HistoryRow, ScreenKey, WorkType } from "@/types/app";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? "https://ptobot-backend.onrender.com";
const DEFAULT_LOGO_URL = "https://storage.yandexcloud.net/ptobot-assets/LOGO.svg";

type UserRole = "contractor" | "manager";

export default function App() {
  const PREVIEW_COMPONENTS = useMemo(
    () => ({
      minimalist: MinimalistLayout,
      glass: GlassmorphismLayout,
      corporate: CorporateStrictLayout,
    }),
    []
  );

  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoReveal, setLogoReveal] = useState(false);
  const [previewVariant, setPreviewVariant] = useState<string | null>(null);

  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const fromQuery = qs.get("logo");
      setLogoUrl(fromQuery || DEFAULT_LOGO_URL);
      setPreviewVariant(qs.get("preview"));
    } catch (error) {
      console.warn("Cannot parse query params", error);
      setLogoUrl(DEFAULT_LOGO_URL);
      setPreviewVariant(null);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => setLogoReveal(true), 180);
  }, []);

  useEffect(() => {
    setLogoLoaded(false);
  }, [logoUrl]);

  const [activeScreen, setActiveScreen] = useState<ScreenKey>("objects");
  const [project, setProject] = useState<string | undefined>("1");
  const [workType, setWorkType] = useState<string | undefined>("2");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [volume, setVolume] = useState("");
  const [machines, setMachines] = useState("");
  const [people, setPeople] = useState("");
  const [comment, setComment] = useState("");
  const [requiredHintVisible, setRequiredHintVisible] = useState(false);

  const [workTypes, setWorkTypes] = useState<WorkType[]>([
    { id: "1", name: "Земляные работы" },
    { id: "2", name: "Бетонирование" },
    { id: "3", name: "Монтаж конструкций" },
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileValidationMessage, setFileValidationMessage] = useState<string | null>(
    null
  );

  const swipeAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2500);

    fetch(`${API_URL}/work-types`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }

        return response.json();
      })
      .then((rows: Array<{ id: string | number; name: string }>) => {
        if (Array.isArray(rows) && rows.length) {
          const mapped: WorkType[] = rows.map((item) => ({
            id: String(item.id),
            name: item.name,
          }));
          setWorkTypes(mapped);
          if (!workType) {
            setWorkType(mapped[0].id);
          }
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
        } else if (error instanceof TypeError) {
        }
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [workType]);

  const contractorName = "Алексей";

  const projects = [
    { id: "1", name: "ЖК «Северный»", address: "ул. Парковая, 12" },
    { id: "2", name: "ЖК «Академический»", address: "пр-т Науки, 5" },
  ];

  const contractorObjects = useMemo<ContractorObject[]>(
    () => [
      {
        id: "1",
        name: "ЖК «Северный»",
        address: "ул. Парковая, 12",
        lastReportDate: "today",
        status: "sent",
        hasTodayReport: true,
      },
      {
        id: "2",
        name: "ЖК «Академический»",
        address: "пр-т Науки, 5",
        lastReportDate: "2024-10-05",
        status: "missing",
        hasTodayReport: false,
      },
    ],
    []
  );

  const history = useMemo<HistoryRow[]>(
    () => [
      {
        id: 101,
        project_id: "1",
        date: "2025-11-11",
        work_type_id: "2",
        description:
          "Бетонирование ростверка\nОбъём: 12,5 м³\nТехника: 2\nЛюди: 7",
        photos: [
          "https://picsum.photos/seed/a/300/200",
          "https://picsum.photos/seed/b/300/200",
        ],
      },
      {
        id: 100,
        project_id: "1",
        date: "2025-11-10",
        work_type_id: "1",
        description:
          "Разработка котлована\nОбъём: 80 м³\nТехника: 3\nЛюди: 5",
        photos: ["https://picsum.photos/seed/c/300/200"],
      },
    ],
    []
  );

  const onPickFiles = () => fileInputRef.current?.click();

  const onFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);

    if (!selected.length) {
      setFileValidationMessage("Добавьте хотя бы одно фото для отчёта");
      setFiles([]);
      setPreviews([]);
      return;
    }

    setFileValidationMessage(null);
    setFiles(selected);

    Promise.all(
      selected.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          })
      )
    ).then(setPreviews);
  };

  const handleOpenObjectCard = (objectId: string) => {
    setProject(objectId);
    setActiveScreen("dashboard");
    requestAnimationFrame(() =>
      swipeAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const formCompletion = useMemo(() => {
    const total = 4;
    const filled = [project, workType, date, files.length ? "files" : null].filter(
      Boolean
    ).length;
    return Math.max(8, Math.round((filled / total) * 100));
  }, [date, files.length, project, workType]);

  const latestHistoryDate = history[0]?.date;

  const isFormReady = useMemo(
    () => Boolean(project && workType && date && files.length > 0),
    [project, workType, date, files.length]
  );

  const missingFields = useMemo(() => {
    const fields: string[] = [];
    if (!project) fields.push("объект");
    if (!workType) fields.push("вид работ");
    if (!date) fields.push("дату");
    if (!files.length) fields.push("фото");
    return fields;
  }, [project, workType, date, files.length]);

  async function sendReport() {
    setRequiredHintVisible(true);
    if (!project || !workType || !date || !files.length) {
      alert("Заполните обязательные поля перед отправкой");
      return;
    }

    const descParts = [comment];
    if (volume) descParts.push(`Объём: ${volume}`);
    if (machines) descParts.push(`Техника: ${machines}`);
    if (people) descParts.push(`Люди: ${people}`);
    const description = descParts.filter(Boolean).join("\n");

    const form = new FormData();
    form.append("user_id", "1");
    form.append("project_id", String(project ?? ""));
    form.append("work_type_id", String(workType));
    form.append("date", date);
    form.append("description", description);
    form.append("people", people);
    form.append("volume", volume);
    form.append("machines", machines);
    files.forEach((file) => form.append("photos", file));

    try {
      setSending(true);
      setProgress(25);
      const res = await fetch(`${API_URL}/reports`, {
        method: "POST",
        body: form,
        mode: "cors",
        credentials: "omit",
      });
      setProgress(80);
      if (!res.ok) throw new Error("Ошибка при отправке отчёта");
      const data = await res.json();
      setProgress(100);
      alert(`Отчёт успешно отправлен! ID: ${data.id}`);
      setVolume("");
      setMachines("");
      setPeople("");
      setComment("");
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при отправке отчёта";
      alert(message);
    } finally {
      setSending(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  const previewKey = previewVariant?.toLowerCase() as
    | keyof typeof PREVIEW_COMPONENTS
    | undefined;
  const PreviewComponent = previewKey
    ? PREVIEW_COMPONENTS[previewKey]
    : undefined;

  const userRole: UserRole = "contractor";

  const handleClearFiles = () => {
    setFiles([]);
    setPreviews([]);
    setFileValidationMessage("Добавьте хотя бы одно фото для отчёта");
  };

  const contractorContent = (
    <>
      {activeScreen === "objects" ? (
        <ContractorHomeScreen
          userName={contractorName}
          objects={contractorObjects}
          onOpenObject={handleOpenObjectCard}
          logoUrl={logoUrl}
          logoLoaded={logoLoaded}
          logoReveal={logoReveal}
          onLogoLoad={() => setLogoLoaded(true)}
        />
      ) : (
        <DashboardScreen
          projects={projects}
          workTypes={workTypes}
          history={history}
          project={project}
          workType={workType}
          date={date}
          volume={volume}
          machines={machines}
          people={people}
          comment={comment}
          previews={previews}
          fileValidationMessage={fileValidationMessage}
          sending={sending}
          progress={progress}
          requiredHintVisible={requiredHintVisible}
          onProjectChange={setProject}
          onWorkTypeChange={setWorkType}
          onDateChange={setDate}
          onVolumeChange={setVolume}
          onMachinesChange={setMachines}
          onPeopleChange={setPeople}
          onCommentChange={setComment}
          onPickFiles={onPickFiles}
          onClearFiles={handleClearFiles}
          onSendReport={sendReport}
          onFilesSelected={onFilesSelected}
          swipeAreaRef={swipeAreaRef}
          fileInputRef={fileInputRef}
          hasFiles={Boolean(files.length)}
          isFormReady={isFormReady}
          missingFields={missingFields}
          onBack={() => setActiveScreen("objects")}
        />
      )}
    </>
  );

  const managerContent = <div className="text-white">TODO: manager screens</div>;

  const content = userRole === "contractor" ? contractorContent : managerContent;

  return PreviewComponent ? (
    <PreviewComponent />
  ) : (
    <div
      className="relative flex h-[100dvh] w-full flex-col text-white"
      style={{
        backgroundColor: "var(--app-surface)",
        backgroundImage: "var(--app-surface-gradient)",
        overscrollBehaviorY: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-indigo-500/40 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-120px] h-[420px] w-[420px] rounded-full bg-sky-400/35 blur-[160px]" />
      <div className="pointer-events-none absolute inset-x-1/2 top-[40%] h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-[120px]" />

      <main
        className="safe-area-page relative z-10 flex h-[100dvh] w-full flex-1 justify-center overflow-y-scroll overscroll-none px-3 touch-pan-y md:px-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto w-full max-w-full md:max-w-[620px] lg:max-w-[700px]">
          {content}
        </div>
      </main>
    </div>
  );
}
