import React, { ReactNode, useEffect, useMemo, useState } from "react";
import type { TelegramViewportChangedData, TelegramWebApp } from "@/types/telegram";

const DEFAULT_LOGO_URL = "https://storage.yandexcloud.net/ptobot-assets/LOGO.svg";

interface GlassPageProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const useTelegramShell = () => {
  useEffect(() => {
    const tg: TelegramWebApp | undefined =
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
    const tg: TelegramWebApp | undefined =
      typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

    if (!tg) return undefined;

    let restoreSwipeBehavior: (() => void | Promise<void>) | null = null;
    let isSwipeApplied = false;

    try {
      tg.ready?.();
      tg.expand?.();
    } catch (error) {
      console.warn("[WebApp] Ошибка ready/expand в новом UI", error);
    }

    const previousAllowSwipe = tg.settings?.allow_vertical_swipe;

    const applySwipeBehavior = async () => {
      try {
        if (
          tg.isVersionAtLeast?.("7.7") &&
          typeof tg.setSwipeBehavior === "function"
        ) {
          const result = await tg.setSwipeBehavior({ allow_vertical_swipe: false });
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
                typeof previousAllowSwipe === "boolean" ? previousAllowSwipe : true;
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
              console.warn("[WebApp] Ошибка enableVerticalSwipes", error);
            }
          };
        }
      } catch (error) {
        console.warn("[WebApp] Ошибка при настройке свайпов (новый UI)", error);
      }
    };

    void applySwipeBehavior();

    return () => {
      if (restoreSwipeBehavior) {
        void Promise.resolve(restoreSwipeBehavior()).catch((error) => {
          console.warn("[WebApp] Ошибка отката свайпов (новый UI)", error);
        });
      }
    };
  }, []);
};

export const GlassPage: React.FC<GlassPageProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoReveal, setLogoReveal] = useState(false);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_URL);

  useTelegramShell();

  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const fromQuery = qs.get("logo");
      setLogoUrl(fromQuery || DEFAULT_LOGO_URL);
    } catch (error) {
      console.warn("Cannot parse query params", error);
      setLogoUrl(DEFAULT_LOGO_URL);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => setLogoReveal(true), 180);
  }, []);

  useEffect(() => {
    setLogoLoaded(false);
  }, [logoUrl]);

  const headerContent = useMemo(() => {
    if (!title && !subtitle && !actions) return null;
    return (
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title ? (
            <h1 className="text-xl font-semibold text-white sm:text-2xl">{title}</h1>
          ) : null}
          {subtitle ? (
            <p className="text-sm text-white/70 sm:text-base">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    );
  }, [title, subtitle, actions]);

  return (
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
        <div className="mx-auto w-full max-w-full md:max-w-[620px] lg:max-w-[720px]">
          <div className="relative rounded-[32px] px-4 pb-8 pt-6 sm:rounded-[44px] sm:px-6 sm:pb-9 sm:pt-7 lg:rounded-[52px] lg:px-8 lg:pb-10 lg:pt-8">
            <div className="glass-grid-overlay" />
            <div className="relative">
              <header className="mb-4 flex items-center justify-between sm:mb-6">
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
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
              </header>
              {headerContent}
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
