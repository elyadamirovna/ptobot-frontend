export type ContractorObject = {
  id: string;
  name: string;
  address?: string;
  lastReportDate?: string; // ISO
  hasTodayReport: boolean;
};

export type ManagerObjectStatus = "onTrack" | "delayed";

export type ManagerObject = {
  id: string;
  name: string;
  status: ManagerObjectStatus;
  readinessPercent: number;
  readinessDelta?: number; // изменение за период, +/- число
  lastReportDate?: string;
  foremanName?: string;
};
