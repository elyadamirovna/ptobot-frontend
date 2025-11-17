import React, { useMemo, useState, useEffect, useRef } from "react";

import {
  CorporateStrictLayout,
  GlassmorphismLayout,
  MinimalistLayout,
} from "@/components/LayoutVariants";

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

const API_URL = "https://ptobot-backend.onrender.com";

type WorkType = { id: string; name: string };

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

export default function TelegramWebAppGlassPure() {
  const PREVIEW_COMPONENTS = useMemo(
    () => ({
      minimalist: MinimalistLayout,
      glass: GlassmorphismLayout,
      corporate: CorporateStrictLayout,
    }),
    []
  );

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [previewVariant, setPreviewVariant] = useState<string | null>(null);

  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const fromQuery = qs.get("logo");
      setLogoUrl(fromQuery || "");
      setPreviewVariant(qs.get("preview"));
    } catch (error) {
      console.warn("Cannot parse query params", error);
      setLogoUrl("");
      setPreviewVariant(null);
    }
  }, []);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;

    if (!telegram) {
      return;
    }

    try {
      telegram.ready();
      if (typeof telegram.expand === "function") {
        telegram.expand();
      }

      if (typeof telegram.setSwipeBehavior === "function") {
        telegram.setSwipeBehavior({ allowVerticalSwipe: false });
      } else if (typeof telegram.disableVerticalSwipes === "function") {
        telegram.disableVerticalSwipes();
      }
    } catch (error) {
      console.warn("Cannot init Telegram WebApp behavior", error);
    }

    return () => {
      try {
        if (typeof telegram.setSwipeBehavior === "function") {
          telegram.setSwipeBehavior({ allowVerticalSwipe: true });
        } else if (typeof telegram.enableVerticalSwipes === "function") {
          telegram.enableVerticalSwipes();
        }
      } catch (error) {
        console.warn("Cannot restore Telegram WebApp behavior", error);
      }
    };
  }, []);

  const previewKey = previewVariant?.toLowerCase() as
    | keyof typeof PREVIEW_COMPONENTS
    | undefined;
  const PreviewComponent = previewKey
    ? PREVIEW_COMPONENTS[previewKey]
    : undefined;

  if (PreviewComponent) {
    return <PreviewComponent />;
  }

  const [activeTab, setActiveTab] = useState("report");
  const [project, setProject] = useState<string | undefined>("1");
  const [workType, setWorkType] = useState<string | undefined>("2");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [volume, setVolume] = useState("");
  const [machines, setMachines] = useState("");
  const [people, setPeople] = useState("");
  const [comment, setComment] = useState("");

  const [workTypes, setWorkTypes] = useState<WorkType[]>([
    { id: "1", name: "Земляные работы" },
    { id: "2", name: "Бетонирование" },
    { id: "3", name: "Монтаж конструкций" },
  ]);

  useEffect(() => {
    fetch(`${API_URL}/work_types`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) {
          const mapped: WorkType[] = rows.map((item: any) => ({
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
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onPickFiles = () => fileInputRef.current?.click();

  const onFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
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

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  async function sendReport() {
    if (!workType) {
      alert("Выберите вид работ");
      return;
    }
    if (!files.length) {
      alert("Пожалуйста, выберите фото!");
      return;
    }

    const descParts = [comment];
    if (volume) descParts.push(`Объём: ${volume}`);
    if (machines) descParts.push(`Техника: ${machines}`);
    if (people) descParts.push(`Люди: ${people}`);
    const description = descParts.filter(Boolean).join("\n");

    const form = new FormData();
    form.append("user_id", "1");
    form.append("work_type_id", String(workType));
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
    } catch (error: any) {
      alert(error?.message || "Ошибка при отправке отчёта");
    } finally {
      setSending(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05122D] px-3 py-6 text-white md:px-4 md:py-10">
      <div className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-sky-500/40 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-600/40 blur-[160px]" />
      <div className="pointer-events-none absolute inset-x-1/2 top-[40%] h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/30 blur-[120px]" />

      <div className="relative z-10 w-full max-w-full md:max-w-[520px] lg:max-w-[600px]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/25 bg-white/10 px-4 pb-8 pt-6 shadow-[0_35px_100px_rgba(6,24,74,0.62)] backdrop-blur-[36px] sm:rounded-[44px] sm:px-6 sm:pb-9 sm:pt-7 lg:rounded-[52px] lg:px-8 lg:pb-10 lg:pt-8">
          <div className="absolute inset-x-6 -top-32 h-48 rounded-full bg-white/10 blur-[120px] sm:inset-x-8" />
          <div className="absolute inset-0 rounded-[28px] border border-white/10 sm:rounded-[36px] lg:rounded-[44px]" />

          <div className="relative">
            <header className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-[0_12px_32px_rgba(59,130,246,0.4)]">
                    <img src={logoUrl} alt="Логотип" className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-white/85 text-sm font-semibold text-sky-800 shadow-[0_12px_32px_rgba(3,144,255,0.7)]">
                    РБК
                  </div>
                )}
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/70 sm:text-[11px]">
                    Стройинвест
                  </div>
                  <div className="text-[11px] font-medium text-white/85 sm:text-xs">
                    Ежедневные отчёты по объектам
                  </div>
                </header>

                <TabsList className="grid grid-cols-3 gap-1 rounded-full bg-white/15 p-1 text-[11px] text-white/75 sm:text-[12px]">
                  <TabsTrigger
                    value="report"
                    className="flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[10px] transition data-[state=active]:bg-white data-[state=active]:text-sky-900 data-[state=active]:shadow-[0_12px_30px_rgба(255,255,255,0.45)] sm:px-3 sm:py-2 sm:text-[12px]"
                  >
                    <ClipboardList className="h-3.5 w-3.5" /> Отчёт
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[10px] transition data-[state=active]:bg-white data-[state=active]:text-sky-900 data-[state=active]:shadow-[0_12px_30px_rgба(255,255,255,0.45)] sm:px-3 sm:py-2 sm:text-[12px]"
                  >
                    <History className="h-3.5 w-3.5" /> История
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[10px] transition data-[state=active]:bg-white data-[state=active]:text-sky-900 data-[state=active]:shadow-[0_12px_30px_rgба(255,255,255,0.45)] sm:px-3 sm:py-2 sm:text-[12px]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Доступ
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/75 text-[10px] font-semibold text-sky-900 shadow-[0_14px_34px_rgba(2,110,255,0.65)] sm:h-9 sm:w-9 sm:text-[11px]">
                ИП
              </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 grid grid-cols-3 gap-1 rounded-full bg-white/15 p-1 text-[11px] text-white/75 sm:mb-5 sm:text-[12px]">
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

              <TabsContent value="report" className="mt-0">
                <Card className="border-white/20 bg-white/10 text-white shadow-[0_24px_60px_rgba(15,28,83,0.45)] backdrop-blur-[28px]">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[18px] font-semibold tracking-wide text-white sm:text-[20px]">
                      Ежедневный отчёт
                    </CardTitle>
                    <p className="text-xs text-white/80">{formatRu(date)}</p>
                  </CardHeader>
                  <CardContent className="space-y-5 text-[12px] sm:text-[13px]">
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
                        <span className="text-white/55">JPG/PNG/HEIC, до 10 МБ</span>
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
                          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-4 py-1.5 text-[12px] font-semibold text-sky-900 shadow-[0_18px_50px_rgба(3,144,255,0.9)] hover:brightness-110"
                          onClick={onPickFiles}
                        >
                          <Upload className="h-3.5 w-3.5" /> Выбрать
                        </Button>
                      </div>

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
                          className="h-11 rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-6 text-[12px] font-semibold text-sky-900 shadow-[0_24px_60px_rgba(3,144,255,0.85)] hover:brightness-110 disabled:opacity-70 sm:text-[13px]"
                          onClick={sendReport}
                          disabled={sending}
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
                      {progress > 0 && (
                        <p className="text-[10px] text-white/70 sm:text-[11px]">Загрузка: {progress}%</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <Card className="border-white/20 bg-white/10 text-white shadow-[0_24px_60px_rgба(15,28,83,0.45)] backdrop-blur-[28px]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-white sm:text-[18px]">
                      <History className="h-4 w-4" /> История отчётов
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 text-[11px] sm:text-[12px]">
                    <div className="grid gap-3 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2 space-y-1.5">
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
                            className="rounded-3xl border border-white/15 bg-white/5 p-3 backdrop-blur text-white/85"
                          >
                            <div className="flex flex-col gap-1 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:text-[12px]">
                              <span>{formatRu(item.date)}</span>
                              <span className="text-white/75">
                                {workTypes.find((row) => row.id === item.work_type_id)?.name}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-white/85 sm:text-[12px]">{toOneLine(item.description)}</p>
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

              <TabsContent value="admin" className="mt-0">
                <Card className="border-white/20 bg-white/10 text-white shadow-[0_24px_60px_rgба(15,28,83,0.45)] backdrop-blur-[28px]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-white sm:text-[18px]">
                      <ShieldCheck className="h-4 w-4" /> Назначение доступа
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 text-[11px] sm:text-[12px]">
                    <div className="grid gap-3 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-1 space-y-1.5">
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
                              <SelectItem value="reporter">Может отправлять отчёты</SelectItem>
                              <SelectItem value="viewer">Только просмотр</SelectItem>
                              <SelectItem value="manager">Менеджер</SelectItem>
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
                            className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 px-3 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <div className="text-[12px] font-medium text-white/90 sm:text-[13px]">{row.user.name}</div>
                              <div className="text-[10px] text-white/65 sm:text-[11px]">
                                Проекты: {row.projects.map((pid) => projects.find((item) => item.id === pid)?.name).join(", ")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/70 sm:text-[11px]">Роль: {row.role}</span>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 rounded-full border-none bg-white/85 px-3 text-[10px] font-semibold text-sky-800 shadow-[0_12px_32px_rgба(3,144,255,0.55)] hover:brightness-110 sm:text-[11px]"
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
      </div>
    </div>
  );
}

function formatRu(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function toOneLine(desc: string) {
  const source = String(desc || "");
  const vol = source.match(/Объём:\s*([^\n]+)/i)?.[1]?.trim();
  const mach = source.match(/Техника:\s*([^\n]+)/i)?.[1]?.trim();
  const ppl = source.match(/Люди:\s*([^\n]+)/i)?.[1]?.trim();
  const parts: string[] = [];
  if (vol) parts.push(`Объём: ${vol}`);
  if (mach) parts.push(`Техника: ${mach}`);
  if (ppl) parts.push(`Люди: ${ppl}`);
  return parts.length ? parts.join(" • ") : source.replace(/\s+/g, " ").trim();
}
