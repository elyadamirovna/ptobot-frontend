export type WorkType = { id: string; name: string };

export type HistoryRow = {
  id: number;
  project_id: string;
  date: string;
  work_type_id: string;
  description: string;
  photos: string[];
  volume?: string;
  people?: number;
  machines?: number;
  comment?: string;
};

export type ScreenKey = "objects" | "report";
