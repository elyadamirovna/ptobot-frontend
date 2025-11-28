import { FC, useState } from "react";

import { ContractorHomeScreen } from "@/components/screens/ContractorHomeScreen";
import { ManagerDashboardScreen } from "@/components/screens/ManagerDashboardScreen";
import { Button } from "@/components/ui/button";
import type {
  ContractorObject,
  ManagerFilter,
  ManagerObject,
  Role,
} from "@/types/objects";

type AppRootProps = {
  role: Role;
  userName: string;
  contractorObjects: ContractorObject[];
  managerObjects: ManagerObject[];
  contractorLoading?: boolean;
  managerLoading?: boolean;
  managerFilter: ManagerFilter;
  onManagerFilterChange: (filter: ManagerFilter) => void;
  onCreateReport: () => void;
  onOpenObject: (objectId: string) => void;
  onOpenFilters: () => void;
};

export const AppRoot: FC<AppRootProps> = ({
  role,
  userName,
  contractorObjects,
  managerObjects,
  contractorLoading,
  managerLoading,
  managerFilter,
  onManagerFilterChange,
  onCreateReport,
  onOpenObject,
  onOpenFilters,
}) => {
  if (role === "contractor") {
    return (
      <ContractorHomeScreen
        userName={userName}
        objects={contractorObjects}
        isLoading={contractorLoading}
        onCreateReport={onCreateReport}
        onOpenObject={onOpenObject}
      />
    );
  }

  return (
    <ManagerDashboardScreen
      objects={managerObjects}
      isLoading={managerLoading}
      activeFilter={managerFilter}
      onFilterChange={onManagerFilterChange}
      onOpenFilters={onOpenFilters}
      onOpenObject={onOpenObject}
    />
  );
};

export default function App() {
  const [role, setRole] = useState<Role>("contractor");
  const [managerFilter, setManagerFilter] = useState<ManagerFilter>("all");

  const contractorObjects: ContractorObject[] = [
    {
      id: "1",
      name: "ЖК «Северный», корпус 3",
      address: "Москва, ул. Летняя, 12",
      lastReportDate: new Date().toISOString(),
      hasTodayReport: true,
    },
    {
      id: "2",
      name: "Деловой центр «Невский»",
      address: "Санкт-Петербург, Невский пр., 128",
      lastReportDate: "2025-11-24",
      hasTodayReport: false,
    },
    {
      id: "3",
      name: "Складской комплекс «Вектор»",
      lastReportDate: undefined,
      hasTodayReport: false,
    },
  ];

  const managerObjects: ManagerObject[] = [
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
      name: "Бизнес-квартал «Высота»",
      status: "delayed",
      readinessPercent: 58,
      readinessDelta: -4,
      lastReportDate: "2025-11-20",
      foremanName: "Петров А.",
    },
    {
      id: "3",
      name: "Логистический парк «Юг»",
      status: "onTrack",
      readinessPercent: 82,
      readinessDelta: 6,
      lastReportDate: "2025-11-18",
      foremanName: "Сидоров Н.",
    },
    {
      id: "4",
      name: "ТЦ «Горизонт»",
      status: "delayed",
      readinessPercent: 44,
      readinessDelta: -8,
      lastReportDate: "2025-11-19",
      foremanName: "Кузнецов Р.",
    },
  ];

  const handleCreateReport = () => {
    console.log("Создать отчёт");
  };

  const handleOpenObject = (objectId: string) => {
    console.log("Открыть объект", objectId);
  };

  const handleOpenFilters = () => {
    console.log("Открыть фильтры");
  };

  const userName = role === "contractor" ? "Алексей" : "Мария";

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#0a1430] via-[#0d1838] to-[#0f2149]" />

      <div className="fixed right-4 top-4 z-30 flex gap-2 text-xs font-semibold text-white/80">
        <Button
          variant={role === "contractor" ? "default" : "secondary"}
          size="sm"
          onClick={() => setRole("contractor")}
          className="shadow-md shadow-cyan-500/30"
        >
          Подрядчик
        </Button>
        <Button
          variant={role === "manager" ? "default" : "secondary"}
          size="sm"
          onClick={() => setRole("manager")}
          className="shadow-md shadow-cyan-500/30"
        >
          Руководитель
        </Button>
      </div>

      <AppRoot
        role={role}
        userName={userName}
        contractorObjects={contractorObjects}
        managerObjects={managerObjects}
        contractorLoading={false}
        managerLoading={false}
        managerFilter={managerFilter}
        onManagerFilterChange={setManagerFilter}
        onCreateReport={handleCreateReport}
        onOpenObject={handleOpenObject}
        onOpenFilters={handleOpenFilters}
      />
    </div>
  );
}
