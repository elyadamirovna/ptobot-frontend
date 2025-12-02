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
import { ContractorHome } from "@/screens/contractor/ContractorHome";
import {
  ContractorReportCreate,
  TAB_ORDER,
  TabKey,
} from "@/screens/contractor/ContractorReportCreate";
import {
  ContractorObjectReports,
  ObjectReport,
} from "@/screens/contractor/ObjectReports";
import { DirectorDashboard } from "@/screens/director/DirectorDashboard";
import { DirectorObjectReports } from "@/screens/director/ObjectReports";
import { ContractorObject, ManagerObject } from "@/types/objects";
import type {
  TelegramViewportChangedData,
  TelegramWebApp,
} from "@/types/telegram";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? "https://ptobot-backend.onrender.com";
const DEFAULT_LOGO_URL = "https://storage.yandexcloud.net/ptobot-assets/LOGO.svg";

const mockContractorObjects: ContractorObject[] = [
  {
    id: "1",
    name: "ЖК «Северный»",
    address: "ул. Парковая, 12",
    hasTodayReport: true,
    lastReportDate: new Date().toISOString().slice(0, 10),
  },
  {
    id: "2",
    name: "ЖК «Академический»",
    address: "пр-т Науки, 5",
    hasTodayReport: false,
    lastReportDate: "2025-11-10",
  },
];

const mockManagerObjects: ManagerObject[] = [
  {
    id: "1",
    name: "ЖК «Северный»",
    status: "onTrack",
    readinessPercent: 76,
    readinessDelta: 3,
    lastReportDate: "2025-11-11",
    foremanName: "Иван Петров",
  },
  {
    id: "2",
    name: "ЖК «Академический»",
    status: "delayed",
    readinessPercent: 58,
    readinessDelta: -2,
    lastReportDate: "2025-11-09",
    foremanName: "Олег Сидоров",
  },
  {
    id: "3",
    name: "ТЦ «Город»",
    status: "onTrack",
    readinessPercent: 42,
    lastReportDate: "2025-11-08",
  },
];

const mockObjectReports: ObjectReport[] = [
  {
    id: 101,
    projectId: "1",
    date: "2025-11-11",
    workType: "Бетонирование",
    volume: "12,5 м³",
    machines: "2",
    people: "7",
    photos: [
      "https://picsum.photos/seed/a/300/200",
      "https://picsum.photos/seed/b/300/200",
      "https://picsum.photos/seed/d/300/200",
    ],
  },
  {
    id: 100,
    projectId: "1",
    date: "2025-11-10",
    workType: "Земляные работы",
    volume: "80 м³",
    machines: "3",
    people: "5",
    photos: ["https://picsum.photos/seed/c/300/200"],
  },
  {
    id: 201,
    projectId: "2",
    date: "2025-11-09",
    workType: "Отделка",
    volume: "120 м²",
    machines: "1",
    people: "6",
    photos: [
      "https://picsum.photos/seed/e/300/200",
      "https://picsum.photos/seed/f/300/200",
    ],
  },
];

type UserRole = "contractor" | "director";

type RoutePath =
  | "/contractor/home"
  | "/contractor/report-create"
  | `/contractor/object/${string}/reports`
  | "/director/dashboard"
  | `/director/object/${string}/reports`;

interface RoleAwareRootProps {
  activeTab: TabKey;
  onActiveTabChange: (tab: TabKey) => void;
}

function RoleAwareRoot({ activeTab, onActiveTabChange }: RoleAwareRootProps) {
  const [role] = useState<UserRole>("contractor");
  const [route, setRoute] = useState<RoutePath>(
    role === "director" ? "/director/dashboard" : "/contractor/home"
  );

  const objectId = useMemo(() => {
    if (route.startsWith("/contractor/object/")) {
      return route.split("/")[3];
    }
    if (route.startsWith("/director/object/")) {
      return route.split("/")[3];
    }
    return null;
  }, [route]);

  const contractorObject = useMemo(
    () => (objectId ? mockContractorObjects.find((item) => item.id === objectId) : null),
    [objectId]
  );

  const directorObject = useMemo(
    () => (objectId ? mockManagerObjects.find((item) => item.id === objectId) : null),
    [objectId]
  );

  const filteredReports = useMemo(
    () => (objectId ? mockObjectReports.filter((report) => report.projectId === objectId) : []),
    [objectId]
  );

  const userName = "Дмитрий";

  const goToRoute = useCallback((path: RoutePath) => {
    setRoute(path);
  }, []);

  const goToReportCreate = useCallback(() => {
    onActiveTabChange("report");
    goToRoute("/contractor/report-create");
  }, [goToRoute, onActiveTabChange]);

  if (route === "/director/dashboard") {
    return (
      <DirectorDashboard
        userName={userName}
        objects={mockManagerObjects}
        onOpenObject={(objectId) =>
          goToRoute(`/director/object/${objectId}/reports` as RoutePath)
        }
        onOpenFilters={() => {
          console.log("Open filters");
        }}
      />
    );
  }

  if (route.startsWith("/director/object/")) {
    return (
      <DirectorObjectReports
        objectName={directorObject?.name ?? "Объект"}
        reports={filteredReports}
        onBack={() => goToRoute("/director/dashboard")}
      />
    );
  }

  if (route === "/contractor/home") {
    return (
      <ContractorHome
        userName={userName}
        objects={mockContractorObjects}
        onCreateReport={goToReportCreate}
        onOpenObject={(objectId) =>
          goToRoute(`/contractor/object/${objectId}/reports` as RoutePath)
        }
      />
    );
  }

  if (route.startsWith("/contractor/object/")) {
    return (
      <ContractorObjectReports
        objectName={contractorObject?.name ?? "Объект"}
        reports={filteredReports}
        onBack={() => goToRoute("/contractor/home")}
      />
    );
  }

  return (
    <ContractorReportCreate
      activeTab={activeTab}
      onActiveTabChange={onActiveTabChange}
      apiUrl={API_URL}
    />
  );
}

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

              <RoleAwareRoot
                activeTab={activeTab}
                onActiveTabChange={setActiveTab}
              />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
