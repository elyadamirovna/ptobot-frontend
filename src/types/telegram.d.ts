export type TelegramSwipeBehaviorOptions = {
  allowVerticalSwipe: boolean;
};

export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;
  setSwipeBehavior?(options: TelegramSwipeBehaviorOptions): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
