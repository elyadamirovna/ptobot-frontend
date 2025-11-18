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
  // базовые методы
  ready?(): void;
  expand?(): void;
  close(): void;

  // информация о версии может быть, но нам не критична
  version?: string;

  // новая пара методов для свайпов
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;

  // старые способы управления свайпами
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
