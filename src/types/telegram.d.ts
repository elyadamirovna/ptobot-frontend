// src/types/telegram.d.ts

export type TelegramSwipeBehaviorOptions = {
  allow_vertical_swipe: boolean;
};

export type TelegramSettingsOptions = {
  allow_vertical_swipe?: boolean;
};

export type TelegramEventType =
  | "web_app_ready"
  | "web_app_expand"
  | "web_app_exit_fullscreen"
  | "web_app_close"
  | "web_app_setup_back_button"
  | "web_app_setup_main_button"
  | "back_button_pressed"
  | "themeChanged"
  | "viewportChanged"
  | string;

export type TelegramEventHandler<T = any> = (eventData?: T) => void;

export interface TelegramBackButton {
  show(): void;
  hide(): void;
  onClick(handler: () => void): void;
  offClick(handler: () => void): void;
}

export interface TelegramWebApp {
  version?: string;
  isVersionAtLeast?(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;
  setSettings?(options: TelegramSettingsOptions): void;
  setSwipeBehavior?(options: TelegramSwipeBehaviorOptions): void;
  onEvent?(eventType: TelegramEventType, handler: TelegramEventHandler): void;
  offEvent?(eventType: TelegramEventType, handler: TelegramEventHandler): void;
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
