export type Role = 'foreman' | 'manager';

export interface Project {
  id: string;
  name: string;
  address?: string;
  lastReportDate?: string;
  readinessPercent?: number;
  status?: 'on_track' | 'delayed' | 'no_reports';
}

export interface WorkItem {
  id: string;
  type: string;
  volume?: number;
  unit?: string;
  readinessPercent?: number;
  comment?: string;
}

export interface Resources {
  workersCount?: number;
  machinesCount?: number;
}

export interface ReportPhoto {
  id: string;
  url: string;
  comment?: string;
}

export interface Report {
  id: string;
  projectId: string;
  date: string;
  shift?: 'day' | 'night';
  weather?: string;
  works: WorkItem[];
  resources?: Resources;
  comment?: string;
  photos: ReportPhoto[];
  foremanName?: string;
  objectReadinessPercent?: number;
  hasProblems?: boolean;
}
