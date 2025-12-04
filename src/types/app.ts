export type WorkType = { id: string; name: string };

export type HistoryRow = {
  id: number;
  project_id: string;
  date: string;
  work_type_id: string;
  description: string;
  photos: string[];
};

export type AccessRow = {
  user: { id: number; name: string };
  projects: string[];
  role: string;
};

export type TabKey = "report" | "history" | "admin";
export type ScreenKey = "dashboard" | "objects";
