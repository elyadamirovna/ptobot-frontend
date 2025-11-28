// src/App.tsx
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

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
import type {
  TelegramViewportChangedData,
  TelegramWebApp,
} from "@/types/telegram";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? "https://ptobot-backend.onrender.com";
const DEFAULT_LOGO_URL = "https://storage.yandexcloud.net/ptobot-assets/LOGO.svg";

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

type TabKey = "report" | "history" | "admin";
const TAB_ORDER: TabKey[] = ["report", "history", "admin"];

export default function TelegramWebAppGlassPure() {
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
    // запускаем появление логотипа после загрузки страницы
    setTimeout(() => setLogoReveal(true), 180);
  }, []);

  useEffect(() => {
    setLogoLoaded(false);
  }, [logoUrl]);

  const [activeTab, setActiveTab] = useState<TabKey>("report");
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

  const [backendReachable, setBackendReachable] = useState<
    "unknown" | "ok" | "error"
  >("unknown");
  const [backendError, setBackendError] = useState<string>("");

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
  const telegramRef = useRef<TelegramWebApp | null>(null);
  const activeTabRef = useRef<TabKey>("report");

  // ------------------------------------------------------------------
  // Поддержка безопасной области (вырезы устройства + UI Telegram)
  // ------------------------------------------------------------------
  useEffect(() => {
    const tg =
      typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

    if (!tg || typeof document === "undefined") return undefined;

    const rootStyle = document.documentElement?.style;
    if (!rootStyle) return undefined;

    const applyInsets = (top = 0, bottom = 0) => {
      rootStyle.setProperty("--tg-safe-area-inset-top", `${top}px`);
      rootStyle.setProperty("--tg-safe-area-inset-bottom", `${bottom}px`);
    };

    const syncInsets = (eventData?: TelegramViewportChangedData) => {
      // 1) Safe area с учётом UI Telegram (верхняя панель, нижние кнопки)
      const contentSafeArea =
        eventData?.contentSafeAreaInsets ??
        eventData?.contentSafeAreaInset ??
        tg.viewport?.contentSafeAreaInsets ??
        tg.contentSafeAreaInsets ??
        tg.contentSafeAreaInset;

      // 2) Системный safe area устройства
      const safeArea =
        eventData?.safeAreaInsets ??
        eventData?.safeAreaInset ??
        tg.viewport?.safeAreaInsets ??
        tg.safeAreaInsets ??
        tg.safeAreaInset;

      const top = contentSafeArea?.top ?? safeArea?.top ?? 0;
      const bottom = contentSafeArea?.bottom ?? safeArea?.bottom ?? 0;

      if (top !== 0 || bottom !== 0) {
        applyInsets(top, bottom);
        return;
      }

      // 3) Фолбэк через стабильную высоту
      const stableHeight = eventData?.stableHeight ?? tg.viewportStableHeight;
      const viewportHeight = eventData?.height ?? tg.viewportHeight ?? stableHeight;

      if (typeof window !== "undefined" && viewportHeight) {
        const bottomInset = Math.max(0, window.innerHeight - viewportHeight);
        applyInsets(0, bottomInset);
      }
    };

    // первичная синхронизация
    syncInsets();

    // Отключено: события вызывают дёргание интерфейса при скролле.
    // Safe-area рассчитываем один раз при старте, этого достаточно.
    // tg.onEvent?.("viewportChanged", handleViewportChange);
    // tg.onEvent?.("safeAreaChanged", handleSafeAreaChange);
    // tg.onEvent?.("contentSafeAreaChanged", handleSafeAreaChange);

    return undefined;
  }, []);

  const changeTabBySwipe = useCallback(
    (direction: 1 | -1) => {
      setActiveTab((current) => {
        const index = TAB_ORDER.indexOf(current);
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= TAB_ORDER.length) {
          return current;
        }
        return TAB_ORDER[nextIndex];
      });
    },
    []
  );

  // ------------------------------------------------------------------
  // Telegram WebApp: ready/expand, BackButton, отключение вертикальных свайпов
  // ------------------------------------------------------------------
  useEffect(() => {
    const tg =
      typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

    telegramRef.current = tg ?? null;

    if (!tg) {
      console.log(
        "[WebApp] Telegram.WebApp не найден (скорее всего, обычный браузер)"
      );
      return undefined;
    }

    const cleanupFns: Array<() => void> = [];
    const pushCleanup = (fn: () => void) => cleanupFns.push(fn);

    // ready / expand
    try {
      tg.ready?.();
      tg.expand?.();
    } catch (error) {
      console.warn("[WebApp] Ошибка при вызове ready/expand", error);
    }

    // --- BackButton видимость и поведение ---
    const syncBackButtonVisibility = () => {
      const backButton = tg.BackButton;
      if (!backButton) return;

      try {
        if (activeTabRef.current !== "report") {
          backButton.show();
        } else {
          backButton.hide();
        }
      } catch (error) {
        console.warn("[WebApp] Ошибка при обновлении BackButton", error);
      }
    };

    const handleBackButtonClick = () => {
      if (activeTabRef.current !== "report") {
        setActiveTab("report");
        return;
      }
      try {
        tg.close?.();
      } catch (error) {
        console.warn("[WebApp] Не удалось закрыть Mini App", error);
      }
    };

    if (tg.BackButton) {
      try {
        tg.BackButton.onClick(handleBackButtonClick);
        pushCleanup(() => tg.BackButton?.offClick(handleBackButtonClick));
        syncBackButtonVisibility();
      } catch (error) {
        console.warn("[WebApp] Не удалось настроить BackButton", error);
      }
    }

    const handleBackButtonSetupEvent = () => {
      console.log("[WebApp] Событие web_app_setup_back_button");
      syncBackButtonVisibility();
    };

    const handleExpandEvent = () => {
      console.log("[WebApp] Событие web_app_expand");
    };

    const handleExitFullscreenEvent = () => {
      console.log(
        "[WebApp] Событие web_app_exit_fullscreen, пробуем expand ещё раз"
      );
      try {
        tg.expand?.();
      } catch (error) {
        console.warn("[WebApp] Ошибка повторного expand", error);
      }
    };

    if (typeof tg.onEvent === "function") {
      tg.onEvent("web_app_expand", handleExpandEvent);
      pushCleanup(() => tg.offEvent?.("web_app_expand", handleExpandEvent));

      tg.onEvent("web_app_exit_fullscreen", handleExitFullscreenEvent);
      pushCleanup(() =>
        tg.offEvent?.("web_app_exit_fullscreen", handleExitFullscreenEvent)
      );

      tg.onEvent("web_app_setup_back_button", handleBackButtonSetupEvent);
      pushCleanup(() =>
        tg.offEvent?.("web_app_setup_back_button", handleBackButtonSetupEvent)
      );
    }

    // --- Отключение системного vertical swipe (pull-to-close) ---
    let isDestroyed = false;
    let isSwipeApplied = false;
    let restoreSwipeBehavior: (() => void | Promise<void>) | null = null;

    const previousAllowSwipe = tg.settings?.allow_vertical_swipe;

    const runRestore = () => {
      if (!restoreSwipeBehavior) return;
      const restore = restoreSwipeBehavior;
      restoreSwipeBehavior = null;
      Promise.resolve(restore()).catch((error) => {
        console.warn("[WebApp] Ошибка при откате swipeBehavior", error);
      });
    };

    const applySwipeBehavior = async () => {
      if (isDestroyed || isSwipeApplied) return;

      try {
        // Новый API: setSwipeBehavior (v7.7+)
        if (
          tg.isVersionAtLeast?.("7.7") &&
          typeof tg.setSwipeBehavior === "function"
        ) {
          const result = await tg.setSwipeBehavior({
            allow_vertical_swipe: false,
          });

          if (result !== false) {
            isSwipeApplied = true;
            restoreSwipeBehavior = async () => {
              await tg.setSwipeBehavior?.({ allow_vertical_swipe: true });
            };
            return;
          }
        }

        // setSettings fallback
        if (typeof tg.setSettings === "function") {
          const result = await tg.setSettings({ allow_vertical_swipe: false });

          if (result !== false) {
            isSwipeApplied = true;
            restoreSwipeBehavior = async () => {
              const targetValue =
                typeof previousAllowSwipe === "boolean"
                  ? previousAllowSwipe
                  : true;
              await tg.setSettings?.({ allow_vertical_swipe: targetValue });
            };
            return;
          }
        }

        // Старый API: disableVerticalSwipes
        if (typeof tg.disableVerticalSwipes === "function" && !isSwipeApplied) {
          tg.disableVerticalSwipes();
          isSwipeApplied = true;
          restoreSwipeBehavior = () => {
            try {
              tg.enableVerticalSwipes?.();
            } catch (error) {
              console.warn(
                "[WebApp] Ошибка при enableVerticalSwipes в cleanup",
                error
              );
            }
          };
        }
      } catch (error) {
        console.warn("[WebApp] Ошибка при настройке свайпов", error);
      }
    };

    const handleSetupSwipeBehavior = () => {
      if (isSwipeApplied || isDestroyed) return;
      void applySwipeBehavior();
    };

    const supportsSwipeSetupEvent =
      typeof tg.onEvent === "function" &&
      (typeof tg.isVersionAtLeast !== "function" ||
        tg.isVersionAtLeast("7.7"));

    if (supportsSwipeSetupEvent) {
      tg.onEvent("web_app_setup_swipe_behavior", handleSetupSwipeBehavior);
      pushCleanup(() =>
        tg.offEvent?.("web_app_setup_swipe_behavior", handleSetupSwipeBehavior)
      );
    } else {
      // для старых клиентов пробуем сразу
      void applySwipeBehavior();
    }

    return () => {
      isDestroyed = true;
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch (error) {
          console.warn("[WebApp] Ошибка в cleanup", error);
        }
      });
      runRestore();
      telegramRef.current = null;
    };
  }, []);

  // актуальный таб для BackButton
  useEffect(() => {
    activeTabRef.current = activeTab;

    const backButton = telegramRef.current?.BackButton;
    if (!backButton) return;

    try {
      if (activeTab !== "report") {
        backButton.show();
      } else {
        backButton.hide();
      }
    } catch (error) {
      console.warn(
        "[WebApp] Ошибка при обновлении BackButton из эффекта",
        error
      );
    }
  }, [activeTab]);

  // Горизонтальный свайп по контенту (между табами), вертикальный остаётся скроллом
  useEffect(() => {
    const container = swipeAreaRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let isTracking = false;
    let isHorizontal = false;

    const resetTracking = () => {
      startX = 0;
      startY = 0;
      isTracking = false;
      isHorizontal = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTracking = true;
      isHorizontal = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isTracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (!isHorizontal) {
        if (Math.abs(deltaX) > 12 || Math.abs(deltaY) > 12) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            isHorizontal = true;
          } else {
            // вертикальный жест — отдаём браузеру / Telegram для скролла
            resetTracking();
          }
        }
      }
    };

    const finishSwipe = (event: TouchEvent) => {
      if (!isTracking) {
        resetTracking();
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const horizontalEnough =
        Math.abs(deltaX) >= 60 && Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontal && horizontalEnough) {
        if (deltaX < 0) {
          // свайп влево → следующая вкладка
          changeTabBySwipe(1);
        } else {
          // свайп вправо → предыдущая вкладка
          changeTabBySwipe(-1);
        }
      }

      resetTracking();
    };

    const handleTouchCancel = () => {
      resetTracking();
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", finishSwipe);
    container.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", finishSwipe);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [changeTabBySwipe]);

  // --- проверка соединения с backend + загрузка видов работ ---
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    fetch(`${API_URL}/work_types`, { signal: controller.signal, mode: "cors" })
      .then((response) => {
        if (!response.ok) {
          setBackendReachable("error");
          setBackendError(`Backend вернул код ${response.status}`);
          return Promise.reject();
        }

        setBackendReachable("ok");
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
          setBackendReachable("error");
          setBackendError("Тайм-аут запроса к backend");
        } else if (error instanceof TypeError) {
          setBackendReachable("error");
          setBackendError("Не удалось подключиться (CORS/HTTPS)");
        }

        /* silent fallback to default workTypes */
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [workType]);

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
                    flex h-12 w-36 items-center justify-center overflow-hidden
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

              {backendReachable === "error" ? (
                <div className="mb-3 rounded-2xl border border-red-300/60 bg-red-500/20 px-4 py-3 text-sm leading-tight text-red-50 shadow-[0_10px_30px_rgba(239,68,68,0.25)]">
                  <div className="font-semibold">Нет связи с backend ({API_URL})</div>
                  <div>{backendError || "Проверьте HTTPS и CORS для Telegram WebView."}</div>
                </div>
              ) : null}

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
        </div>
      </main>
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
