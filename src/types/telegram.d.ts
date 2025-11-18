// src/types/telegram.d.ts

export type TelegramSwipeBehaviorOptions = {
  allowVerticalSwipe: boolean;
};

export type TelegramSettingsOptions = {
  allow_vertical_swipe?: boolean;
};

export interface TelegramBackButton {
  show(): void;
  hide(): void;
  onClick(handler: () => void): void;
  offClick(handler: () => void): void;
}

export interface TelegramWebApp {
  /** Telegram WebApp readiness */
  ready?(): void;
  /** Expand Mini App to fullscreen */
  expand?(): void;
  /** Close current Mini App */
  close(): void;

  version?: string;

  /** Native swipe API (Bot API 7.7+) */
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;

  /** Legacy swipe APIs */
  setSwipeBehavior?(options: TelegramSwipeBehaviorOptions): void;
  setSettings?(options: TelegramSettingsOptions): void;

  BackButton?: TelegramBackButton;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
