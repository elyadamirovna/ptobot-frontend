import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { mockProjects, mockReports } from "../components/mockData";

export default function D2_ObjectReports() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find((item) => item.id === id);
  const reports = mockReports.filter((report) => report.projectId === id);

  return (
    <GlassPage
      title={project?.name || "Объект"}
      subtitle="История отчётов"
      actions={<Button variant="secondary" onClick={() => navigate(`/manager/project/${id}/analytics`)}>Аналитика</Button>}
    >
      <div className="space-y-4 text-sm text-white/80">
        <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <span>Адрес</span>
            <span className="text-white/70">{project?.address}</span>
          </div>
          <div className="flex items-center justify-between text-white/70">
            <span>Готовность</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
              {project?.readinessPercent ?? 0}%
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          {reports.map((report) => (
            <Card key={report.id} className="glass-card border-white/15 bg-white/5 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{report.date}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="border border-white/15"
                  onClick={() => navigate(`/manager/project/${id}/report/${report.id}`)}
                >
                  Подробнее
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span>Смена</span>
                  <span>{report.shift === "day" ? "Дневная" : "Ночная"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Комментарий</span>
                  <span className="text-right text-white/70">{report.comment}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Проблемы</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
                    {report.hasProblems ? "Да" : "Нет"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </GlassPage>
  );
}
