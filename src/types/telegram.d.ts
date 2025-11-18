export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;

  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;

  BackButton?: {
    show(): void;
    hide(): void;
    onClick(handler: () => void): void;
    offClick(handler: () => void): void;
  };

  version?: string;
  isVersionAtLeast?(v: string): boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
