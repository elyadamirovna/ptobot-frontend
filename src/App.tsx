import React, { useMemo, useState } from "react";
import { ContractorHomeScreen } from "@/components/ContractorHomeScreen";
import { ManagerDashboardScreen } from "@/components/ManagerDashboardScreen";
import {
  ContractorObject,
  ManagerObject,
  UserRole,
} from "@/types/dashboard";
import { Button } from "@/components/ui/button";

function AppRoot({ role, userName }: { role: UserRole; userName: string }) {
  const contractorObjects = useMemo<ContractorObject[]>(
    () => [
      {
        id: "1",
        name: "ЖК «Северный», корпус 3",
        address: "ул. Центральная, 15",
        lastReportDate: new Date().toISOString(),
        hasTodayReport: true,
      },
      {
        id: "2",
        name: "ДЦ «Аэро», башня Б",
        address: "пр-т Космонавтов, 42",
        lastReportDate: "2025-11-24",
        hasTodayReport: false,
      },
      {
        id: "3",
        name: "Логопарк «Восток»",
        address: "МКАД, 32 км",
        hasTodayReport: false,
      },
    ],
    []
  );

  const managerObjects = useMemo<ManagerObject[]>(
    () => [
      {
        id: "1",
        name: "ЖК «Северный»",
        status: "onTrack",
        readinessPercent: 75,
        readinessDelta: 12,
        lastReportDate: "2025-11-24",
        foremanName: "Иванов И.",
      },
      {
        id: "2",
        name: "ДЦ «Аэро»",
        status: "delayed",
        readinessPercent: 58,
        readinessDelta: -4,
        lastReportDate: "2025-11-22",
        foremanName: "Петров А.",
      },
      {
        id: "3",
        name: "Логопарк «Восток»",
        status: "onTrack",
        readinessPercent: 82,
        readinessDelta: 6,
        lastReportDate: "2025-11-21",
        foremanName: "Сидоров Д.",
      },
    ],
    []
  );

  const handleOpenObject = (objectId: string) => {
    console.log("Open object", objectId);
  };

  const handleCreateReport = () => {
    console.log("Create report tapped");
  };

  const handleOpenFilters = () => {
    console.log("Open filters");
  };

  if (role === "contractor") {
    return (
      <ContractorHomeScreen
        userName={userName}
        objects={contractorObjects}
        onCreateReport={handleCreateReport}
        onOpenObject={handleOpenObject}
      />
    );
  }

  return (
    <ManagerDashboardScreen
      objects={managerObjects}
      onOpenObject={handleOpenObject}
      onOpenFilters={handleOpenFilters}
    />
  );
}

export default function App() {
  const [role, setRole] = useState<UserRole>("contractor");
  const userName = role === "contractor" ? "Игорь Петров" : "Мария Смирнова";

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-3 py-2 backdrop-blur">
        <span className="text-xs uppercase tracking-wide text-sky-100">Роль</span>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            className={`h-8 px-3 rounded-full border-white/30 ${
              role === "contractor"
                ? "bg-white/90 text-slate-900"
                : "bg-white/10 text-white"
            }`}
            onClick={() => setRole("contractor")}
          >
            Подрядчик
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={`h-8 px-3 rounded-full border-white/30 ${
              role === "manager" ? "bg-white/90 text-slate-900" : "bg-white/10 text-white"
            }`}
            onClick={() => setRole("manager")}
          >
            Руководитель
          </Button>
        </div>
      </div>

      <AppRoot role={role} userName={userName} />
    </div>
  );
}
