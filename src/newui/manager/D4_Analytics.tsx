import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassPage } from "../components/GlassPage";
import { mockProjects, mockReports } from "../components/mockData";

export default function D4_Analytics() {
  const { id } = useParams();
  const project = mockProjects.find((item) => item.id === id);
  const reports = mockReports.filter((report) => report.projectId === id);
  const averageReadiness =
    reports.reduce((acc, report) => acc + (report.objectReadinessPercent ?? 0), 0) /
    (reports.length || 1);

  return (
    <GlassPage title="Аналитика" subtitle={project?.name}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.12em] text-white/70">Отчётов</div>
          <div className="text-2xl font-semibold text-white">{reports.length}</div>
        </div>
        <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.12em] text-white/70">Средняя готовность</div>
          <div className="text-2xl font-semibold text-white">{Math.round(averageReadiness)}%</div>
        </div>
        <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.12em] text-white/70">Проблемы</div>
          <div className="text-2xl font-semibold text-white">{reports.filter((r) => r.hasProblems).length}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card className="glass-card border-white/15 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Динамика работ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            <p>
              Последние отчёты показывают стабильный рост готовности. Следите за метриками по мере поступления новых данных.
            </p>
            <div className="h-24 rounded-2xl bg-gradient-to-r from-cyan-300/20 via-indigo-300/20 to-emerald-300/20" />
          </CardContent>
        </Card>
        <Card className="glass-card border-white/15 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Комментарии</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            {reports.map((report) => (
              <div key={report.id} className="glass-chip border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between text-white">
                  <span>{report.date}</span>
                  <span className="text-xs text-white/70">{report.foremanName}</span>
                </div>
                <p className="text-white/70">{report.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </GlassPage>
  );
}
