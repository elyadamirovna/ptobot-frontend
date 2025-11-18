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

  // ------------------------------------------------------
  // ⭐ НОВЫЙ ПРАВИЛЬНЫЙ TELEGRAM useEffect
  // ------------------------------------------------------
  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (!telegram) return;

    const cleanupFns: Array<() => void> = [];

    try {
      telegram.ready();
      telegram.expand?.();

      // 1. Логируем версию WebApp API
      const version = telegram.version;
      console.log("WebApp API version:", version);

      // 2. Определяем поддержку Bot API 7.7+
      const supportsDisableVerticalSwipes =
        typeof telegram.disableVerticalSwipes === "function" &&
        (typeof telegram.isVersionAtLeast !== "function" ||
          telegram.isVersionAtLeast("7.7"));

      // 3. Новый нативный метод — предпочтительный
      if (supportsDisableVerticalSwipes) {
        console.log("Using new disableVerticalSwipes()");
        telegram.disableVerticalSwipes?.();
        cleanupFns.push(() => telegram.enableVerticalSwipes?.());
      } else if (typeof telegram.setSettings === "function") {
        // старый способ
        console.log("Using legacy setSettings()");
        telegram.setSettings({ allow_vertical_swipe: false });
        cleanupFns.push(() =>
          telegram.setSettings?.({ allow_vertical_swipe: true })
        );
      } else if (typeof telegram.setSwipeBehavior === "function") {
        // fallback
        console.log("Using legacy setSwipeBehavior()");
        telegram.setSwipeBehavior({ allowVerticalSwipe: false });
        cleanupFns.push(() =>
          telegram.setSwipeBehavior?.({ allowVerticalSwipe: true })
        );
      } else {
        console.log("No vertical swipe APIs available");
      }

      // 4. BackButton
      const backButton = telegram.BackButton;
      if (backButton) {
        const handleClose = () => {
          try {
            telegram.close();
          } catch (err) {
            console.warn("Cannot close WebApp via BackButton", err);
          }
        };
        backButton.show();
        backButton.onClick(handleClose);
        cleanupFns.push(() => {
          try {
            backButton.offClick(handleClose);
            backButton.hide();
          } catch (err) {
            console.warn("BackButton cleanup error", err);
          }
        });
      }
    } catch (error) {
      console.warn("Telegram WebApp initialization error:", error);
    }

    return () => {
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.warn("Cleanup error:", err);
        }
      });
    };
  }, []);
  // ------------------------------------------------------
  // end telegram useEffect
  // ------------------------------------------------------

  // ... ⬇⬇⬇ ДАЛЬШЕ ВЕСЬ ТВОЙ КОД БЕЗ ИЗМЕНЕНИЙ ⬇⬇⬇

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
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
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
      .then((response) =>
        response.ok ? response.json() : Promise.reject()
      )
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
      .catch(() => {});
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
      {/* ... твой JSX полностью без изменений ... */}
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
