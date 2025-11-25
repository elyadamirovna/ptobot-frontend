import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassPage } from "../components/GlassPage";
import { mockProjects, mockReports } from "../components/mockData";

const statusMap: Record<string, string> = {
  on_track: "bg-emerald-400/20 text-emerald-100",
  delayed: "bg-amber-400/20 text-amber-100",
  no_reports: "bg-white/10 text-white/80",
};

export default function F1_Home() {
  const navigate = useNavigate();
  const latestReports = mockReports.slice(0, 2);

  return (
    <GlassPage
      title="Сводка по объектам"
      subtitle="Режим прораба • быстрый доступ к отчётам"
      actions={
        <Button variant="secondary" onClick={() => navigate("/foreman/new")}>Новый отчёт</Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {mockProjects.map((project) => (
          <Card key={project.id} className="glass-card border-white/20 bg-white/5 text-white shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
              <Badge className={statusMap[project.status || "no_reports"] || "bg-white/10 text-white/80"}>
                {project.status === "on_track" && "В срок"}
                {project.status === "delayed" && "Задержка"}
                {project.status === "no_reports" && "Нет отчётов"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span>Адрес</span>
                <span className="text-right text-white/60">{project.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Готовность</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
                  {project.readinessPercent ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Последний отчёт</span>
                <span className="text-white/70">{project.lastReportDate ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => navigate(`/foreman/project/${project.id}`)}
                >
                  Отчёты
                </Button>
                <Button variant="ghost" className="w-full border border-white/15" onClick={() => navigate(`/foreman/new?project=${project.id}`)}>
                  Новый отчёт
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold text-white">Последние отчёты</h2>
        <div className="grid gap-3">
          {latestReports.map((report) => {
            const project = mockProjects.find((item) => item.id === report.projectId);
            return (
              <Card key={report.id} className="glass-card border-white/15 bg-white/5 text-white">
                <CardContent className="flex flex-col gap-2 py-4 text-sm text-white/80">
                  <div className="flex items-center justify-between text-white">
                    <span className="font-medium">{project?.name}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{report.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Смена</span>
                    <span>{report.shift === "day" ? "Дневная" : "Ночная"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Выполнено работ</span>
                    <span className="text-white">{report.objectReadinessPercent ?? 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/foreman/new/preview?from=${report.id}`)}>
                      Открыть черновик
                    </Button>
                    <Button size="sm" variant="ghost" className="border border-white/15" onClick={() => navigate(`/foreman/project/${report.projectId}`)}>
                      История
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </GlassPage>
  );
}
