import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Building2,
  HardHat,
  Users,
  Image as ImageIcon,
  Upload,
  ChevronDown,
  History,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { formatRu, toOneLine } from "@/lib/format";

export type TabKey = "report" | "history" | "admin";

const TAB_ORDER: TabKey[] = ["report", "history", "admin"];

export type WorkType = { id: string; name: string };

type HistoryRow = {
  id: number;
  project_id: string;
  date: string;
  work_type_id: string;
  description: string;
  photos: string[];
};

type AccessRow = {
  user: { id: number; name: string };
  projects: string[];
  role: string;
};

interface ContractorReportCreateProps {
  activeTab: TabKey;
  onActiveTabChange: (value: TabKey) => void;
  apiUrl: string;
}

export function ContractorReportCreate({
  activeTab,
  onActiveTabChange,
  apiUrl,
}: ContractorReportCreateProps) {
  const [project, setProject] = useState<string | undefined>("1");
  const [workType, setWorkType] = useState<string | undefined>("2");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
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
  const [fileValidationMessage, setFileValidationMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const projects = [
    { id: "1", name: "ЖК «Северный»", address: "ул. Парковая, 12" },
    { id: "2", name: "ЖК «Академический»", address: "пр-т Науки, 5" },
  ];

  const history = useMemo<HistoryRow[]>(
    () => [
      {
        id: 101,
        project_id: "1",
        date: "2025-11-11",
        work_type_id: "2",
        description: "Бетонирование ростверка\nОбъём: 12,5 м³\nТехника: 2\nЛюди: 7",
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

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    fetch(`${apiUrl}/work_types`, { signal: controller.signal, mode: "cors" })
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
      .catch(() => {
        /* silent fallback to default workTypes */
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [apiUrl, workType]);

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
  }, [date, files.length, project, workType]);

  const sendReport = useCallback(() => {
    if (!isFormReady) {
      setRequiredHintVisible(true);
      setTimeout(() => setRequiredHintVisible(false), 2000);
      return;
    }

    setSending(true);
    setProgress(12);

    setTimeout(() => setProgress(64), 600);
    setTimeout(() => setProgress(92), 1000);

    const payload = {
      project_id: project,
      work_type_id: workType,
      date,
      volume,
      machines,
      people,
      comment,
    };

    fetch(`${apiUrl}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify(payload),
    })
      .then(() => {
        setProgress(100);
        setTimeout(() => setSending(false), 500);
      })
      .catch(() => {
        setSending(false);
        setProgress(0);
      });
  }, [apiUrl, comment, date, isFormReady, machines, people, project, volume, workType]);

  const onChangeTab = (value: TabKey) => {
    onActiveTabChange(value);
  };

  const getSummaryForRow = useCallback(
    (row: HistoryRow) => {
      const workTypeName = workTypes.find((w) => w.id === row.work_type_id)?.name ?? "Вид работ";
      const projectName = projects.find((p) => p.id === row.project_id)?.name;
      return `${projectName ?? "Объект"} • ${workTypeName}`;
    },
    [projects, workTypes]
  );

  return (
    <div className="space-y-5">
      <Tabs value={activeTab} onValueChange={(value) => onChangeTab(value as TabKey)}>
        <TabsList className="mb-4 grid grid-cols-3 rounded-[24px] bg-white/10 p-1 text-white backdrop-blur">
          <TabsTrigger
            value="report"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-[0_16px_40px_rgba(6,17,44,0.28)]"
          >
            Отчёт
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-[0_16px_40px_rgba(6,17,44,0.28)]"
          >
            История
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-[0_16px_40px_rgba(6,17,44,0.28)]"
          >
            Доступы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-0">
          <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_24px_70px_rgba(6,17,44,0.52)] backdrop-blur-[30px]">
            <CardHeader className="pb-4 sm:pb-5">
              <CardTitle className="text-[18px] font-semibold tracking-wide text-white sm:text-[20px]">
                Создать отчёт
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 sm:p-6 sm:pt-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                    Объект
                  </p>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="h-11 rounded-2xl border border-white/20 bg-white/10 text-[13px] font-medium text-white/90 sm:h-12 sm:text-[14px]">
                      <Building2 className="mr-2 h-4 w-4 opacity-70" />
                      <SelectValue placeholder="Выберите объект" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-white/10 bg-slate-900/90 text-white backdrop-blur">
                      {projects.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-white/60">{projects.find((p) => p.id === project)?.address}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Вид работ</p>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger className="h-11 rounded-2xl border border-white/20 bg-white/10 text-[13px] font-medium text-white/90 sm:h-12 sm:text-[14px]">
                      <HardHat className="mr-2 h-4 w-4 opacity-70" />
                      <SelectValue placeholder="Выберите вид работ" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-white/10 bg-slate-900/90 text-white backdrop-blur">
                      {workTypes.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {latestHistoryDate && (
                    <p className="flex items-center gap-2 text-[11px] text-white/60">
                      <History className="h-3.5 w-3.5" />
                      Последний отчёт: {formatRu(latestHistoryDate)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Дата</p>
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
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Объём</p>
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
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Техника</p>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="3"
                      value={machines}
                      onChange={(event) => setMachines(event.target.value)}
                      className="h-11 flex-1 rounded-2xl border border-white/20 bg-white/10 text-[13px] font-medium text-white/90 placeholder:text-white/40 sm:h-12 sm:text-[14px]"
                    />
                    <div className="flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3 text-[11px] text-white/75 sm:h-12 sm:px-4 sm:text-[12px]">
                      шт.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Люди</p>
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Комментарий</p>
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
                  <span className="text-white/55">JPG/PNG/HEIC, до 10 МБ</span>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />

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
                        setFileValidationMessage("Добавьте хотя бы одно фото для отчёта");
                      }}
                    >
                      Очистить
                    </Button>
                  )}
                </div>

                {fileValidationMessage && (
                  <p className="text-[10px] font-medium text-amber-200/90 sm:text-[11px]">{fileValidationMessage}</p>
                )}

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-3 sm:gap-3">
                  {(previews.length ? previews : [null, null, null]).slice(0, 3).map((src, index) => (
                    <div
                      key={index}
                      className="flex aspect-square items-center justify-center rounded-xl border border-white/20 bg-white/5 sm:aspect-[4/3] sm:rounded-2xl"
                    >
                      {src ? (
                        <img src={src} alt="Предпросмотр" className="h-full w-full rounded-xl object-cover sm:rounded-2xl" />
                      ) : (
                        <span className="text-[10px] text-white/45 sm:text-[11px]">Фото</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    className="h-11 rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-6 text-[13px] font-semibold text-sky-900 shadow-[0_18px_50px_rgba(3,144,255,0.9)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 sm:h-12 sm:text-[14px]"
                    disabled={!isFormReady || sending}
                    onClick={sendReport}
                  >
                    {sending ? `Отправка… ${progress}%` : "Отправить отчёт"}
                  </Button>
                  <div className="text-[11px] text-white/70 sm:text-[12px]">
                    Заполнено: {formCompletion}% • {files.length || 0} фото
                  </div>
                </div>
                {!isFormReady && requiredHintVisible && (
                  <p className="text-[10px] text-amber-200/90 sm:text-[11px]">Заполните: {missingFields.join(", ")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_24px_70px_rgba(6,17,44,0.52)] backdrop-blur-[30px]">
            <CardHeader className="pb-4 sm:pb-5">
              <CardTitle className="text-[18px] font-semibold tracking-wide text-white sm:text-[20px]">История отчётов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:p-6 sm:pt-1">
              {history.map((row) => (
                <div
                  key={row.id}
                  className="space-y-2 rounded-3xl border border-white/12 bg-white/8 p-4 text-[12px] text-white/90 shadow-[0_12px_32px_rgba(6,17,44,0.35)] backdrop-blur sm:text-[13px]"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                    <span className="rounded-full bg-white/10 px-2 py-1">{formatRu(row.date)}</span>
                    <span className="rounded-full bg-white/10 px-2 py-1">{projects.find((p) => p.id === row.project_id)?.name}</span>
                    <span className="rounded-full bg-white/10 px-2 py-1">
                      {workTypes.find((w) => w.id === row.work_type_id)?.name ?? "Вид работ"}
                    </span>
                  </div>
                  <div className="font-medium text-white">{toOneLine(row.description)}</div>
                  {row.photos.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {row.photos.map((src, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_10px_28px_rgba(6,17,44,0.35)]"
                        >
                          <img src={src} alt="Фото отчёта" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="mt-0">
          <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_24px_70px_rgba(6,17,44,0.52)] backdrop-blur-[30px]">
            <CardHeader className="pb-4 sm:pb-5">
              <CardTitle className="text-[18px] font-semibold tracking-wide text-white sm:text-[20px]">Назначение доступа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:p-6 sm:pt-1">
              <div className="grid grid-cols-1 gap-3 rounded-3xl border border-white/18 bg-white/6 p-4 sm:grid-cols-3 sm:gap-3.5">
                <div className="space-y-1.5 sm:col-span-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">Найти подрядчика</p>
                  <Input
                    placeholder="Поиск по названию / Telegram"
                    className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 placeholder:text-white/50 sm:text-[12px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">Объект</p>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]">
                      <SelectValue placeholder="Выберите объект" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-white/10 bg-slate-900/90 text-white backdrop-blur">
                      {projects.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">Роль</p>
                  <Select defaultValue="reporter">
                    <SelectTrigger className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]">
                      <SelectValue placeholder="Роль" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-white/10 bg-slate-900/90 text-white backdrop-blur">
                      <SelectItem value="reporter">Прораб / подрядчик</SelectItem>
                      <SelectItem value="approver">Руководитель</SelectItem>
                      <SelectItem value="viewer">Наблюдатель</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                {accessList.map((row) => (
                  <div
                    key={row.user.id}
                    className="flex flex-col gap-2 rounded-3xl border border-white/12 bg-white/8 p-4 text-[12px] text-white/85 shadow-[0_12px_32px_rgba(6,17,44,0.35)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:text-[13px]"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">{row.user.name}</div>
                      <div className="text-white/60">ID: {row.user.id}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] text-white">
                        <ClipboardList className="h-3.5 w-3.5" /> {row.projects.length} объектов
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] text-white">
                        <ShieldCheck className="h-3.5 w-3.5" /> {row.role}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full border-white/25 bg-white/15 px-3 text-[11px] text-white hover:bg-white/25"
                      >
                        Настроить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { TAB_ORDER };
