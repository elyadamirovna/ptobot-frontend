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

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import type {
  TelegramViewportChangedData,
  TelegramWebApp,
} from "@/types/telegram";

type TabKey = "report" | "history" | "admin";
const TAB_ORDER: TabKey[] = ["report", "history", "admin"];

const DEFAULT_LOGO_URL = "https://storage.yandexcloud.net/ptobot-assets/LOGO.svg";

export type ContractorObject = {
  id: string;
  name: string;
  address?: string;
  lastReportDate?: string; // ISO
  hasTodayReport: boolean;
};

export type ManagerObjectStatus = "onTrack" | "delayed";

export type ManagerObject = {
  id: string;
  name: string;
  status: ManagerObjectStatus;
  readinessPercent: number;
  readinessDelta?: number; // может быть отрицательным/положительным
  lastReportDate?: string;
  foremanName?: string;
};

const mockContractorObjects: ContractorObject[] = [
  {
    id: "1",
    name: "ЖК «Северный», корпус 3",
    address: "ул. Парковая, 12",
    lastReportDate: "2025-11-26",
    hasTodayReport: true,
  },
  {
    id: "2",
    name: "ЖК «Академический», секция Б",
    address: "пр-т Науки, 5",
    lastReportDate: "2025-11-24",
    hasTodayReport: false,
  },
];

const mockManagerObjects: ManagerObject[] = [
  {
    id: "1",
    name: "ЖК «Северный»",
    status: "onTrack",
    readinessPercent: 72,
    readinessDelta: 8,
    lastReportDate: "2025-11-26",
    foremanName: "Иванов И.",
  },
  {
    id: "2",
    name: "ЖК «Академический»",
    status: "delayed",
    readinessPercent: 54,
    readinessDelta: -5,
    lastReportDate: "2025-11-25",
    foremanName: "Петров П.",
  },
];

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

              <RoleAwareRoot />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface RoleAwareRootProps {}

function RoleAwareRoot(_props: RoleAwareRootProps) {
  const [role] = useState<UserRole>("contractor");
  const userName = "Иван";

  if (role === "contractor") {
    return (
      <ContractorHomeScreen
        userName={userName}
        objects={mockContractorObjects}
        onCreateReport={() => console.log("create report")}
        onOpenObject={(id) => console.log("open contractor object", id)}
      />
    );
  }

  return (
    <ManagerDashboardScreen
      userName={userName}
      objects={mockManagerObjects}
      onOpenObject={(id) => console.log("open manager object", id)}
      onOpenFilters={() => console.log("open filters")}
    />
  );
}

interface ContractorHomeScreenProps {
  userName: string;
  objects: ContractorObject[];
  onCreateReport: () => void;
  onOpenObject: (objectId: string) => void;
}

function ContractorHomeScreen({
  userName,
  objects,
  onCreateReport,
  onOpenObject,
}: ContractorHomeScreenProps) {
  const isLoading = false;

  return (
    <div className="glass-panel border border-white/20 bg-gradient-to-br from-white/12 via-white/10 to-white/5 shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
      <div className="space-y-4 px-4 pb-20 pt-5 sm:px-6 sm:pt-6">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-[12px]">
            РБК Строй Инвест
          </p>
          <h1 className="text-2xl font-semibold text-white sm:text-[28px]">
            Добрый день, {userName}
          </h1>
          <p className="text-[13px] text-white/80 sm:text-[14px]">
            Объекты под вашим контролем
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center text-white/80">
            Загружаем объекты…
          </div>
        ) : objects.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-10 text-center text-white/80 backdrop-blur">
            <div className="text-3xl">🏗️</div>
            <div className="text-lg font-semibold text-white">
              Пока нет назначенных объектов
            </div>
            <div className="text-sm text-white/70">
              Обратитесь к руководителю, чтобы вас добавили на объект.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {objects.map((object) => (
              <Card
                key={object.id}
                className="cursor-pointer rounded-2xl border-0 bg-white text-slate-900 shadow-[0_18px_50px_rgba(6,17,44,0.18)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_60px_rgba(6,17,44,0.2)]"
                onClick={() => onOpenObject(object.id)}
              >
                <CardContent className="space-y-2.5 px-4 py-4 sm:px-5 sm:py-5">
                  <div className="text-[15px] font-semibold sm:text-[16px]">
                    {object.name}
                  </div>
                  {object.address ? (
                    <div className="text-[12px] text-slate-500 sm:text-[13px]">
                      {object.address}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 text-[13px] sm:text-[14px]">
                    <div className="text-slate-700">
                      {object.hasTodayReport
                        ? "Последний отчёт: сегодня"
                        : object.lastReportDate
                          ? `Последний отчёт: ${formatRu(object.lastReportDate)}`
                          : "Отчётов пока нет"}
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold sm:text-[12px] ${
                        object.hasTodayReport
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {object.hasTodayReport ? "отчёт отправлен" : "нет отчёта"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-3 left-0 right-0 px-4 sm:px-6">
        <Button
          onClick={onCreateReport}
          className="h-14 w-full rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] text-lg font-semibold text-sky-900 shadow-[0_24px_60px_rgba(3,144,255,0.85)] hover:brightness-110"
        >
          Создать отчёт
        </Button>
      </div>
    </div>
  );
}

interface ManagerDashboardScreenProps {
  userName: string;
  objects: ManagerObject[];
  onOpenObject: (objectId: string) => void;
  onOpenFilters: () => void;
}

type FilterKey = "all" | "onTrack" | "delayed";

function ManagerDashboardScreen({
  userName,
  objects,
  onOpenObject,
  onOpenFilters,
}: ManagerDashboardScreenProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const isLoadingDashboard = false;

  const filteredObjects = useMemo(() => {
    if (filter === "all") return objects;
    return objects.filter((item) => item.status === filter);
  }, [filter, objects]);

  const onTrackCount = useMemo(
    () => objects.filter((item) => item.status === "onTrack").length,
    [objects]
  );
  const delayedCount = useMemo(
    () => objects.filter((item) => item.status === "delayed").length,
    [objects]
  );

  return (
    <div className="glass-panel border border-white/20 bg-gradient-to-br from-white/12 via-white/10 to-white/5 shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
      <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 sm:pt-6">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-[12px]">
            РБК Строй Инвест
          </p>
          <h1 className="text-2xl font-semibold text-white sm:text-[28px]">
            Дэшборд руководителя
          </h1>
          <p className="text-[13px] text-white/80 sm:text-[14px]">
            Руководитель: {userName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-[13px] text-white/90 backdrop-blur sm:px-4">
          {([
            { key: "all", label: "Все" },
            { key: "onTrack", label: "В срок" },
            { key: "delayed", label: "Отстают" },
          ] as const).map((item) => (
            <Button
              key={item.key}
              variant={filter === item.key ? "secondary" : "ghost"}
              size="sm"
              className={`h-9 rounded-full border-white/20 px-3 text-[12px] font-semibold shadow-[0_12px_30px_rgba(6,17,44,0.25)] transition ${
                filter === item.key
                  ? "bg-white text-sky-900"
                  : "bg-white/10 text-white/90 hover:bg-white/20"
              }`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </Button>
          ))}
          <div className="ml-auto flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-white/15 bg-white/10 text-white/90 hover:bg-white/20"
              onClick={onOpenFilters}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/85 backdrop-blur sm:text-[14px]">
          Объектов: {objects.length} • В срок: {onTrackCount} • Отстают: {delayedCount}
        </div>

        {isLoadingDashboard ? (
          <div className="flex min-h-[220px] items-center justify-center text-white/80">
            Загружаем дэшборд…
          </div>
        ) : filteredObjects.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-10 text-center text-white/80 backdrop-blur">
            <div className="text-3xl">📊</div>
            <div className="text-lg font-semibold text-white">
              Нет доступных объектов
            </div>
            <div className="text-sm text-white/70">
              Добавьте объекты в кабинете администратора.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredObjects.map((object) => (
              <Card
                key={object.id}
                className="cursor-pointer rounded-2xl border-0 bg-white text-slate-900 shadow-[0_18px_50px_rgba(6,17,44,0.18)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_60px_rgba(6,17,44,0.2)]"
                onClick={() => onOpenObject(object.id)}
              >
                <CardContent className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[15px] font-semibold sm:text-[16px]">
                      {object.name}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold sm:text-[12px] ${
                        object.status === "onTrack"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {object.status === "onTrack" ? "в срок" : "отставание"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
                    <span className="text-slate-700">
                      Готовность: {object.readinessPercent}%
                    </span>
                    <span
                      className={`text-[12px] font-semibold sm:text-[13px] ${
                        object.readinessDelta && object.readinessDelta !== 0
                          ? object.readinessDelta > 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                          : "text-slate-500"
                      }`}
                    >
                      {object.readinessDelta && object.readinessDelta !== 0
                        ? `${object.readinessDelta > 0 ? "+" : ""}${object.readinessDelta} % за период`
                        : "без изменений"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-600 sm:text-[13px]">
                    <span>
                      Последний отчёт: {object.lastReportDate ? formatRu(object.lastReportDate) : "—"}
                    </span>
                    {object.foremanName ? (
                      <span className="text-slate-500">• Прораб: {object.foremanName}</span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatRu(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}
