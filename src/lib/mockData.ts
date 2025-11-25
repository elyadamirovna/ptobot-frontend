import { Report, Project, WorkItem, ReportPhoto } from "@/types/reports";

const samplePhotos: ReportPhoto[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
    comment: "Армирование перекрытия",
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1581093588401-22da4c85e8b9?auto=format&fit=crop&w=600&q=80",
    comment: "Бетонирование",
  },
];

const workItem = (partial: Partial<WorkItem>): WorkItem => ({
  id: crypto.randomUUID(),
  type: "Другое",
  ...partial,
});

export const projectsMock: Project[] = [
  {
    id: "project-1",
    name: "ЖК «Северный»",
    address: "ул. Лесная, 12",
    readinessPercent: 75,
    lastReportDate: "2025-11-24",
    status: "on_track",
    foremanName: "Иванов И.",
  },
  {
    id: "project-2",
    name: "ТЦ «Город»",
    address: "пр-т Мира, 48",
    readinessPercent: 52,
    lastReportDate: "2025-11-23",
    status: "delayed",
    foremanName: "Петров А.",
  },
  {
    id: "project-3",
    name: "Логистический центр",
    address: "Шоссе Энтузиастов, 7",
    readinessPercent: 0,
    status: "no_reports",
    foremanName: "—",
  },
];

export const reportsMock: Report[] = [
  {
    id: "r-1",
    projectId: "project-1",
    date: "2025-11-24",
    shift: "day",
    works: [
      workItem({
        type: "Бетонирование перекрытий",
        volume: 12.5,
        unit: "м³",
        readinessPercent: 76,
        comment: "Работали с опережением графика",
      }),
      workItem({
        type: "Армирование",
        volume: 45,
        unit: "м²",
        readinessPercent: 60,
      }),
    ],
    resources: { workersCount: 15, machinesCount: 3 },
    photos: samplePhotos,
    comment: "Остановка бетономешалки на 20 минут, устранили.",
    foremanName: "Иванов И.",
    objectReadinessPercent: 75,
    hasProblems: false,
  },
  {
    id: "r-2",
    projectId: "project-1",
    date: "2025-11-23",
    shift: "night",
    works: [
      workItem({
        type: "Кладка",
        volume: 28,
        unit: "м²",
        readinessPercent: 50,
      }),
    ],
    resources: { workersCount: 9, machinesCount: 1 },
    photos: [],
    comment: "Небольшая задержка поставки кирпича",
    foremanName: "Иванов И.",
    objectReadinessPercent: 72,
    hasProblems: true,
  },
  {
    id: "r-3",
    projectId: "project-2",
    date: "2025-11-24",
    shift: "day",
    works: [
      workItem({
        type: "Инженерные сети",
        volume: 80,
        unit: "м",
        readinessPercent: 40,
      }),
    ],
    resources: { workersCount: 11, machinesCount: 2 },
    photos: [samplePhotos[1]],
    comment: "Проблемы с погодой, перенос части работ",
    foremanName: "Петров А.",
    objectReadinessPercent: 52,
    hasProblems: true,
  },
];

export const workTypeOptions = [
  "Бетонирование перекрытий",
  "Армирование",
  "Кладка",
  "Отделка",
  "Инженерные сети",
  "Другое",
];

export const unitOptions = ["м³", "м²", "шт", "пог.м"];

export const defaultPhotos = samplePhotos;
