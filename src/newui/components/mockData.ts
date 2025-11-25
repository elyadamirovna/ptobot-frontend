import { Project, Report } from "../types";

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "ТЦ Северный",
    address: "Санкт-Петербург, пр. Просвещения, 18",
    lastReportDate: "2024-05-22",
    readinessPercent: 72,
    status: "on_track",
  },
  {
    id: "2",
    name: "Деловой центр Невский",
    address: "Невский пр., 140",
    lastReportDate: "2024-05-21",
    readinessPercent: 48,
    status: "delayed",
  },
  {
    id: "3",
    name: "ЖК Лето",
    address: "Мурино, ул. Шоссе в Лаврики",
    lastReportDate: "2024-05-20",
    readinessPercent: 30,
    status: "no_reports",
  },
];

export const mockReports: Report[] = [
  {
    id: "101",
    projectId: "1",
    date: "2024-05-22",
    shift: "day",
    weather: "+14°С, пасмурно",
    works: [
      { id: "w1", type: "Арматура", volume: 15, unit: "т", readinessPercent: 80 },
      { id: "w2", type: "Бетонирование", volume: 120, unit: "м³", readinessPercent: 65 },
    ],
    resources: { workersCount: 42, machinesCount: 5 },
    comment: "Ведём подготовку под монтаж колонн",
    photos: [
      { id: "p1", url: "https://picsum.photos/seed/1/400/220" },
      { id: "p2", url: "https://picsum.photos/seed/2/400/220" },
    ],
    foremanName: "Иван Петров",
    objectReadinessPercent: 72,
    hasProblems: false,
  },
  {
    id: "102",
    projectId: "2",
    date: "2024-05-21",
    shift: "night",
    weather: "+10°С, дождь",
    works: [
      { id: "w3", type: "Монтаж панелей", volume: 30, unit: "шт", readinessPercent: 40 },
    ],
    resources: { workersCount: 28, machinesCount: 3 },
    comment: "Задержка поставки бетона",
    photos: [{ id: "p3", url: "https://picsum.photos/seed/3/400/220" }],
    foremanName: "Антон Смирнов",
    objectReadinessPercent: 48,
    hasProblems: true,
  },
];
