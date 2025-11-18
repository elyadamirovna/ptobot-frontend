export type TelegramSwipeBehaviorOptions = {
  allowVerticalSwipe: boolean;
};

export type TelegramSettingsOptions = {
  allow_vertical_swipe?: boolean;
};

export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;
  setSwipeBehavior?(options: TelegramSwipeBehaviorOptions): void;
  setSettings?(options: TelegramSettingsOptions): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
