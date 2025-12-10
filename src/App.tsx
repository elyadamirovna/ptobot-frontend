import React, { useMemo, useRef, useState } from "react";
import { DashboardScreen } from "@/components/DashboardScreen";
import HeroBlock from "@/components/HeroBlock";
import PropertyCard, { PropertyCardProps } from "@/components/PropertyCard";
import { AccessRow, HistoryRow, TabKey, WorkType } from "@/types/app";
import "./styles/home.css";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? "https://ptobot-backend.onrender.com";
const DEFAULT_LOGO_URL = "https://storage.yandexcloud.net/ptobot-assets/LOGO.svg";

type Screen = "home" | "dashboard";

const objects: PropertyCardProps[] = [
  {
    id: "1",
    name: "ЖК «Северный»",
    address: "ул. Парковая, 12",
    lastReport: "сегодня",
    status: "sent",
    activity: [1, 1, 0, 0, 0],
  },
  {
    id: "2",
    name: "ЖК «Центральный»",
    address: "пр. Ленина, 45",
    lastReport: "05.10.2024",
    status: "missing",
    activity: [1, 1, 1, 0, 0],
  },
  {
    id: "3",
    name: "ЖК «Восточный»",
    address: "ул. Солнечная, 8",
    lastReport: "29.09.2024",
    status: "missing",
    activity: [0, 1, 0, 0, 0],
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTab, setActiveTab] = useState<TabKey>("report");
  const [project, setProject] = useState<string | undefined>(objects[0]?.id);
  const [workType, setWorkType] = useState<string | undefined>("2");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [volume, setVolume] = useState("");
  const [machines, setMachines] = useState("");
  const [people, setPeople] = useState("");
  const [comment, setComment] = useState("");
  const [requiredHintVisible, setRequiredHintVisible] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileValidationMessage, setFileValidationMessage] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const swipeAreaRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const workTypes = useMemo<WorkType[]>(
    () => [
      { id: "1", name: "Земляные работы" },
      { id: "2", name: "Бетонирование" },
      { id: "3", name: "Монтаж конструкций" },
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
        description: "Бетонирование ростверка\nОбъём: 12,5 м³\nТехника: 2\nЛюди: 7",
        photos: ["https://picsum.photos/seed/a/300/200", "https://picsum.photos/seed/b/300/200"],
      },
      {
        id: 100,
        project_id: "1",
        date: "2025-11-10",
        work_type_id: "1",
        description: "Разработка котлована\nОбъём: 80 м³\nТехника: 3\nЛюди: 5",
        photos: ["https://picsum.photos/seed/c/300/200"],
      },
    ],
    []
  );

  const accessList: AccessRow[] = [
    {
      user: { id: 8, name: "ИП «СтройСервис»" },
      projects: ["1"],
      role: "reporter",
    },
    {
      user: { id: 9, name: "ООО «МонтажГрупп»" },
      projects: ["1", "2"],
      role: "reporter",
    },
  ];

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

  const formCompletion = useMemo(() => {
    const total = 4;
    const filled = [project, workType, date, files.length ? "files" : null].filter(Boolean).length;
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
      const message = error instanceof Error ? error.message : "Ошибка при отправке отчёта";
      alert(message);
    } finally {
      setSending(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  const handleOpenObject = (objectId: string) => {
    setProject(objectId);
    setScreen("dashboard");
    setActiveTab("history");
    requestAnimationFrame(() =>
      swipeAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const handleClearFiles = () => {
    setFiles([]);
    setPreviews([]);
    setFileValidationMessage("Добавьте хотя бы одно фото для отчёта");
  };

  if (screen === "home") {
    return (
      <div className="home-wrapper">
        <HeroBlock activeCount={objects.length} userName="Алексей" subtitle="Управление объектами" />
        <div className="property-list">
          {objects.map((property) => (
            <PropertyCard key={property.id} {...property} onClick={() => handleOpenObject(property.id)} />
          ))}
        </div>
        <div className="hint-text">Тап по объекту → перейти к истории / отчётам</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-3 py-4 text-white sm:px-4 sm:py-6">
      <DashboardScreen
        logoUrl={DEFAULT_LOGO_URL}
        logoLoaded={logoLoaded}
        logoReveal
        onLogoLoad={() => setLogoLoaded(true)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        projects={objects.map((object) => ({ id: object.id, name: object.name, address: object.address }))}
        workTypes={workTypes}
        accessList={accessList}
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
        hasFiles={files.length > 0}
        isFormReady={isFormReady}
        missingFields={missingFields}
        latestHistoryDate={latestHistoryDate}
        formCompletion={formCompletion}
      />
    </div>
  );
}
