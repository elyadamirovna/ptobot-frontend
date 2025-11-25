import React, { createContext, useContext, useMemo, useState } from "react";
import { Report, WorkItem } from "../types";

interface ForemanReportContextValue {
  draft: Report;
  updateDraft: (patch: Partial<Report>) => void;
  addWork: (work: WorkItem) => void;
  removeWork: (id: string) => void;
  resetDraft: () => void;
}

const initialDraft: Report = {
  id: "draft",
  projectId: "1",
  date: new Date().toISOString().slice(0, 10),
  shift: "day",
  weather: "",
  works: [],
  resources: {
    workersCount: 0,
    machinesCount: 0,
  },
  comment: "",
  photos: [],
  foremanName: "",
  objectReadinessPercent: 0,
  hasProblems: false,
};

const ForemanReportContext = createContext<ForemanReportContextValue | null>(null);

export const ForemanReportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [draft, setDraft] = useState<Report>(initialDraft);

  const updateDraft = (patch: Partial<Report>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const addWork = (work: WorkItem) => {
    setDraft((prev) => ({ ...prev, works: [...prev.works, work] }));
  };

  const removeWork = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      works: prev.works.filter((item) => item.id !== id),
    }));
  };

  const resetDraft = () => setDraft(initialDraft);

  const value = useMemo(
    () => ({ draft, updateDraft, addWork, removeWork, resetDraft }),
    [draft]
  );

  return <ForemanReportContext.Provider value={value}>{children}</ForemanReportContext.Provider>;
};

export const useForemanReport = () => {
  const ctx = useContext(ForemanReportContext);
  if (!ctx) throw new Error("useForemanReport must be used within ForemanReportProvider");
  return ctx;
};
