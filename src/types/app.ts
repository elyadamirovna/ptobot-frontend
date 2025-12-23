export type WorkType = { id: string; name: string };

export type HistoryRow = {
  id: number;
  project_id: string;
  date: string;
  work_type_id: string;
  description: string;
  photos: string[];
};
export type ScreenKey = "dashboard" | "objects";
