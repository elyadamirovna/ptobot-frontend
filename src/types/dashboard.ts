export type ContractorObject = {
  id: string;
  name: string;
  address?: string;
  lastReportDate?: string;
  hasTodayReport: boolean;
};

export type ManagerObjectStatus = "onTrack" | "delayed";

export type ManagerObject = {
  id: string;
  name: string;
  status: ManagerObjectStatus;
  readinessPercent: number;
  readinessDelta?: number;
  lastReportDate?: string;
  foremanName?: string;
};

export type UserRole = "contractor" | "manager";
