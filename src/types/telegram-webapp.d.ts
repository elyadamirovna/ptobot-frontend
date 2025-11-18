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
  ready(): void;
  expand(): void;
  close(): void;

  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;

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
