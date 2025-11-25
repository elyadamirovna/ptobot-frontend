import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { mockProjects, mockReports } from "../components/mockData";

export default function F2_ProjectReports() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find((item) => item.id === id);
  const reports = mockReports.filter((report) => report.projectId === id);

  return (
    <GlassPage
      title={project?.name || "Объект"}
      subtitle={project?.address}
      actions={
        <Button variant="secondary" onClick={() => navigate("/foreman/new")}>Создать отчёт</Button>
      }
    >
      <div className="space-y-3 text-sm text-white/80">
        <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <span>Готовность объекта</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white">
              {project?.readinessPercent ?? 0}%
            </span>
          </div>
        </div>
        <div className="grid gap-3">
          {reports.map((report) => (
            <Card key={report.id} className="glass-card border-white/15 bg-white/5 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Отчёт от {report.date}</CardTitle>
                <Button size="sm" variant="ghost" className="border border-white/15" onClick={() => navigate(`/foreman/project/${id}/report/${report.id}`)}>
                  Открыть
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span>Смена</span>
                  <span>{report.shift === "day" ? "Дневная" : "Ночная"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Работы</span>
                  <span>{report.works.map((w) => w.type).join(", ")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ответственный</span>
                  <span>{report.foremanName}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </GlassPage>
  );
}
