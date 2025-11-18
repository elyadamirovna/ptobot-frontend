// src/types/telegram.d.ts

export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;
  setSettings?(options: { allow_vertical_swipe?: boolean }): void;
  setSwipeBehavior?(options: { allowVerticalSwipe: boolean }): void;
  BackButton?: {
    show(): void;
    hide(): void;
    onClick(handler: () => void): void;
    offClick(handler: () => void): void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
