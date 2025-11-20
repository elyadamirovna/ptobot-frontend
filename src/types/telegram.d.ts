// src/types/telegram.d.ts

export type TelegramSwipeBehaviorOptions = {
  // поле из web_app_setup_swipe_behavior
  allow_vertical_swipe: boolean;
};

export type TelegramSettingsOptions = {
  // то же поле, когда Telegram даёт setSettings
  allow_vertical_swipe?: boolean;
};

export type TelegramSafeAreaInsets = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type TelegramViewportState = {
  height?: number;
  width?: number;
  stableHeight?: number;
  safeAreaInsets?: TelegramSafeAreaInsets;
};

export type TelegramViewportChangedData = TelegramViewportState & {
  isStateStable?: boolean;
};

export type TelegramEventType =
  | "web_app_ready"
  | "web_app_expand"
  | "web_app_exit_fullscreen"
  | "web_app_close"
  | "web_app_setup_back_button"
  | "web_app_setup_swipe_behavior"
  | "web_app_setup_main_button"
  | "back_button_pressed"
  | "themeChanged"
  | "viewportChanged"
  | string;

export type TelegramEventHandler<T = unknown> = (eventData?: T) => void;

export interface TelegramBackButton {
  show(): void;
  hide(): void;
  onClick(handler: () => void): void;
  offClick(handler: () => void): void;
}

export interface TelegramWebApp {
  version?: string;
  isVersionAtLeast?(version: string): boolean;

  viewport?: TelegramViewportState;
  viewportHeight?: number;
  viewportStableHeight?: number;
  safeAreaInsets?: TelegramSafeAreaInsets;

  settings?: {
    allow_vertical_swipe?: boolean;
    [key: string]: unknown;
  };

  ready(): void;
  expand(): void;
  close(): void;

  // старые/кастомные методы некоторых клиентов
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;

  // новые настройки (v7.7+)
  setSettings?(options: TelegramSettingsOptions): Promise<boolean> | boolean | void;
  setSwipeBehavior?(options: TelegramSwipeBehaviorOptions):
    | Promise<boolean>
    | boolean
    | void;

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
