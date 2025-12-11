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
import type {
  TelegramViewportChangedData,
  TelegramWebApp,
} from "@/types/telegram";
import {
  ContractorHomeScreen,
  ContractorObject,
} from "@/components/ContractorHomeScreen";
import { DashboardScreen } from "@/components/DashboardScreen";
import { AccessRow, HistoryRow, ScreenKey, TabKey, WorkType } from "@/types/app";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? "https://ptobot-backend.onrender.com";
const DEFAULT_LOGO_URL = "https://storage.yandexcloud.net/ptobot-assets/LOGO.svg";

const TAB_ORDER: TabKey[] = ["report", "history", "admin"];
type UserRole = "contractor" | "manager";

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
    setTimeout(() => setLogoReveal(true), 180);
  }, []);

  useEffect(() => {
    setLogoLoaded(false);
  }, [logoUrl]);

  const [activeScreen, setActiveScreen] = useState<ScreenKey>("objects");
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
      const contentSafeArea =
        eventData?.contentSafeAreaInsets ??
        eventData?.contentSafeAreaInset ??
        tg.viewport?.contentSafeAreaInsets ??
        tg.contentSafeAreaInsets ??
        tg.contentSafeAreaInset;

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

      const stableHeight = eventData?.stableHeight ?? tg.viewportStableHeight;
      const viewportHeight = eventData?.height ?? tg.viewportHeight ?? stableHeight;

      if (typeof window !== "undefined" && viewportHeight) {
        const bottomInset = Math.max(0, window.innerHeight - viewportHeight);
        applyInsets(0, bottomInset);
      }
    };

    syncInsets();

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

    try {
      tg.ready?.();
      tg.expand?.();
    } catch (error) {
      console.warn("[WebApp] Ошибка при вызове ready/expand", error);
    }

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
          changeTabBySwipe(1);
        } else {
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
    container.addEventListener("touchend", finishSwipe, { passive: true });
    container.addEventListener("touchcancel", handleTouchCancel, {
      passive: true,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", finishSwipe);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [changeTabBySwipe]);

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
      },
      {
        id: "2",
        name: "ЖК «Академический»",
        address: "пр-т Науки, 5",
        lastReportDate: "2024-10-05",
        status: "missing",
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

  const handleOpenObjectCard = (objectId: string) => {
    setProject(objectId);
    setActiveScreen("dashboard");
    setActiveTab("history");
    requestAnimationFrame(() =>
      swipeAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const handleCreateReportClick = () => {
    setActiveScreen("dashboard");
    setActiveTab("report");
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

  const handleContractorTabChange = (tab: "objects" | "reports") => {
    if (tab === "objects") {
      setActiveScreen("objects");
      return;
    }

    setActiveScreen("dashboard");
    setActiveTab("history");
    requestAnimationFrame(() =>
      swipeAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const contractorTab = activeScreen === "objects" ? "objects" : "reports";

  const contractorContent = (
    <>
      {activeScreen === "objects" ? (
        <ContractorHomeScreen
          userName={contractorName}
          objects={contractorObjects}
          onOpenObject={handleOpenObjectCard}
        />
      ) : (
        <>
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 text-[12px] text-white shadow-[0_14px_36px_rgba(6,17,44,0.35)] backdrop-blur">
              {[{ key: "objects", label: "Мои объекты" }, { key: "reports", label: "Отчёты и доступ" }].map((item) => {
                const isActive = contractorTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleContractorTabChange(item.key as "objects" | "reports")}
                    className={`min-w-[120px] rounded-full px-4 py-2 font-semibold transition ${
                      isActive
                        ? "bg-white/85 text-slate-900 shadow-[0_12px_28px_rgba(255,255,255,0.35)]"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <DashboardScreen
            logoUrl={logoUrl}
            logoLoaded={logoLoaded}
            logoReveal={logoReveal}
            onLogoLoad={() => setLogoLoaded(true)}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            projects={projects}
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
            hasFiles={Boolean(files.length)}
            isFormReady={isFormReady}
            missingFields={missingFields}
            latestHistoryDate={latestHistoryDate}
            formCompletion={formCompletion}
          />
        </>
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
