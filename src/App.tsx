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
import { HistorySheet } from "@/components/HistorySheet";
import { ReportDetailsSheet } from "@/components/ReportDetailsSheet";
import { ReportFormScreen } from "@/components/ReportFormScreen";
import { HistoryRow, ScreenKey, WorkType } from "@/types/app";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? "https://ptobot-backend.onrender.com";
const DEFAULT_LOGO_URL = "https://storage.yandexcloud.net/ptobot-assets/LOGO.svg";

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
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [workType, setWorkType] = useState<string | undefined>("2");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [volume, setVolume] = useState("");
  const [machines, setMachines] = useState(0);
  const [people, setPeople] = useState(0);
  const [comment, setComment] = useState("");
  const [requiredHintVisible, setRequiredHintVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const telegramRef = useRef<TelegramWebApp | null>(null);
  const activeScreenRef = useRef<ScreenKey>("objects");

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
        if (activeScreenRef.current !== "objects") {
          backButton.show();
        } else {
          backButton.hide();
        }
      } catch (error) {
        console.warn("[WebApp] Ошибка при обновлении BackButton", error);
      }
    };

    const handleBackButtonClick = () => {
      if (activeScreenRef.current !== "objects") {
        setActiveScreen("objects");
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
    activeScreenRef.current = activeScreen;

    const backButton = telegramRef.current?.BackButton;
    if (!backButton) return;

    try {
      if (activeScreen !== "objects") {
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
  }, [activeScreen]);

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

  const [contractorObjects, setContractorObjects] = useState<ContractorObject[]>(
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
    ]
  );

  const [history, setHistory] = useState<HistoryRow[]>(() => [
    {
      id: 102,
      project_id: "1",
      date: new Date().toISOString().slice(0, 10),
      work_type_id: "2",
      description: "Бетонирование ростверка",
      volume: "12,5",
      machines: 2,
      people: 7,
      comment: "Работы выполнены по плану.",
      photos: [
        "https://picsum.photos/seed/a/300/200",
        "https://picsum.photos/seed/b/300/200",
      ],
    },
    {
      id: 101,
      project_id: "1",
      date: "2025-11-11",
      work_type_id: "2",
      description: "Бетонирование ростверка",
      volume: "12,5",
      machines: 2,
      people: 7,
      comment: "Подготовка под дальнейший этап.",
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
      description: "Разработка котлована",
      volume: "80",
      machines: 3,
      people: 5,
      comment: "Без замечаний.",
      photos: ["https://picsum.photos/seed/c/300/200"],
    },
  ]);

  const [historyObjectId, setHistoryObjectId] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);

  const selectedObject = useMemo(
    () =>
      selectedObjectId
        ? contractorObjects.find((object) => object.id === selectedObjectId) ?? null
        : null,
    [contractorObjects, selectedObjectId]
  );

  const historyForSelectedObject = useMemo(() => {
    if (!selectedObjectId) return [];
    return history
      .filter((item) => item.project_id === selectedObjectId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [history, selectedObjectId]);

  const historyForSheet = useMemo(() => {
    if (!historyObjectId) return [];
    return history
      .filter((item) => item.project_id === historyObjectId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
  }, [history, historyObjectId]);

  const activeReport = useMemo(
    () => history.find((item) => item.id === activeReportId) ?? null,
    [activeReportId, history]
  );

  const historyObjectName =
    contractorObjects.find((object) => object.id === historyObjectId)?.name ??
    "Объект";

  const detailsObjectName =
    contractorObjects.find((object) => object.id === activeReport?.project_id)?.name ??
    selectedObject?.name ??
    "Объект";

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormReady = useMemo(
    () => Boolean(selectedObjectId && workType && files.length > 0),
    [files.length, selectedObjectId, workType]
  );

  const missingFields = useMemo(() => {
    const fields: string[] = [];
    if (!workType) fields.push("вид работ");
    if (!files.length) fields.push("фото");
    return fields;
  }, [files.length, workType]);

  useEffect(() => {
    if (!selectedObjectId) {
      setActiveScreen("objects");
      return;
    }

    if (activeScreen === "report") {
      setDate(new Date().toISOString().slice(0, 10));
      const lastReport = historyForSelectedObject[0];
      setWorkType(lastReport?.work_type_id ?? workTypes[0]?.id);
      setVolume(lastReport?.volume ?? "");
      setMachines(lastReport?.machines ?? 0);
      setPeople(lastReport?.people ?? 0);
      setComment(lastReport?.comment ?? "");
    }
  }, [activeScreen, historyForSelectedObject, selectedObjectId, workTypes]);

  const triggerHaptic = useCallback(
    (type: "light" | "success" | "error") => {
      const haptic = telegramRef.current?.HapticFeedback;
      if (!haptic) return;
      try {
        if (type === "light") {
          haptic.impactOccurred?.("light");
        } else {
          haptic.notificationOccurred?.(type === "success" ? "success" : "error");
        }
      } catch (error) {
        console.warn("[WebApp] Ошибка при haptic", error);
      }
    },
    []
  );

  async function sendReport() {
    setRequiredHintVisible(true);
    if (!selectedObjectId || !workType || !files.length) {
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
    form.append("project_id", String(selectedObjectId ?? ""));
    form.append("work_type_id", String(workType));
    form.append("date", date);
    form.append("description", description);
    form.append("people", String(people));
    form.append("volume", volume);
    form.append("machines", String(machines));
    files.forEach((file) => form.append("photos", file));

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      const res = await fetch(`${API_URL}/reports`, {
        method: "POST",
        body: form,
        mode: "cors",
        credentials: "omit",
      });
      if (!res.ok) throw new Error("Ошибка при отправке отчёта");
      const data = await res.json();
      setSubmitSuccess(true);
      triggerHaptic("success");
      const newReportId = Number(data.id) || Date.now();
      setHistory((prev) => [
        {
          id: newReportId,
          project_id: selectedObjectId,
          date,
          work_type_id: workType,
          description,
          volume,
          machines,
          people,
          comment,
          photos: previews.length ? previews : [],
        },
        ...prev,
      ]);
      setContractorObjects((prev) =>
        prev.map((object) =>
          object.id === selectedObjectId
            ? {
                ...object,
                hasTodayReport: true,
                status: "sent",
                lastReportDate: "today",
              }
            : object
        )
      );
      setVolume("");
      setMachines("");
      setPeople("");
      setComment("");
      setFiles([]);
      setPreviews([]);
      setFileValidationMessage("Добавьте хотя бы одно фото для отчёта");
      window.setTimeout(() => {
        setActiveScreen("objects");
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при отправке отчёта";
      setSubmitError(message);
      triggerHaptic("error");
    } finally {
      setIsSubmitting(false);
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

  const handlePeopleChange = (value: number) => {
    setPeople(value);
    triggerHaptic("light");
  };

  const handleMachinesChange = (value: number) => {
    setMachines(value);
    triggerHaptic("light");
  };

  const handleStartReport = (objectId: string) => {
    setSelectedObjectId(objectId);
    setActiveScreen("report");
    setRequiredHintVisible(false);
    setSubmitError(null);
    setSubmitSuccess(false);
    setFiles([]);
    setPreviews([]);
    setFileValidationMessage("Добавьте хотя бы одно фото для отчёта");
  };

  const handleViewTodayReport = (objectId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayReport = history.find(
      (item) => item.project_id === objectId && item.date === today
    );
    if (todayReport) {
      setActiveReportId(todayReport.id);
      setSelectedObjectId(objectId);
      return;
    }
    handleStartReport(objectId);
  };

  const handleOpenHistory = (objectId: string) => {
    setHistoryObjectId(objectId);
  };

  const closeHistory = () => setHistoryObjectId(null);
  const closeReportDetails = () => setActiveReportId(null);

  const contractorContent = (
    <>
      {activeScreen === "objects" ? (
        <ContractorHomeScreen
          userName={contractorName}
          objects={contractorObjects}
          onStartReport={handleStartReport}
          onViewTodayReport={handleViewTodayReport}
          onOpenHistory={handleOpenHistory}
          logoUrl={logoUrl}
          logoLoaded={logoLoaded}
          logoReveal={logoReveal}
          onLogoLoad={() => setLogoLoaded(true)}
        />
      ) : selectedObject ? (
        <ReportFormScreen
          objectName={selectedObject.name}
          date={date}
          workTypes={workTypes}
          workType={workType}
          volume={volume}
          machines={machines}
          people={people}
          comment={comment}
          previews={previews}
          fileValidationMessage={fileValidationMessage}
          isSubmitting={isSubmitting}
          isFormReady={isFormReady}
          requiredHintVisible={requiredHintVisible}
          missingFields={missingFields}
          submitSuccess={submitSuccess}
          submitError={submitError}
          onWorkTypeChange={setWorkType}
          onVolumeChange={setVolume}
          onMachinesChange={handleMachinesChange}
          onPeopleChange={handlePeopleChange}
          onCommentChange={setComment}
          onPickFiles={onPickFiles}
          onClearFiles={handleClearFiles}
          onSendReport={sendReport}
          onFilesSelected={onFilesSelected}
          fileInputRef={fileInputRef}
          hasFiles={Boolean(files.length)}
        />
      ) : null}
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

      <HistorySheet
        isOpen={Boolean(historyObjectId)}
        onClose={closeHistory}
        objectName={historyObjectName}
        reports={historyForSheet}
        workTypes={workTypes}
        onSelectReport={(reportId) => {
          setActiveReportId(reportId);
          closeHistory();
        }}
      />
      <ReportDetailsSheet
        isOpen={Boolean(activeReportId)}
        onClose={closeReportDetails}
        report={activeReport}
        objectName={detailsObjectName}
        workTypes={workTypes}
      />
    </div>
  );
}
