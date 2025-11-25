import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { mockProjects, mockReports } from "../components/mockData";

export default function D3_ReportCard() {
  const { id, reportId } = useParams();
  const navigate = useNavigate();
  const report = mockReports.find((item) => item.id === reportId);
  const project = mockProjects.find((item) => item.id === id);

  return (
    <GlassPage
      title={`Отчёт ${report?.date || ""}`}
      subtitle={project?.name}
      actions={<Button variant="secondary" onClick={() => navigate(-1)}>Назад к списку</Button>}
    >
      <Card className="glass-card border-white/15 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Детали отчёта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/80">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-chip border border-white/15 bg-white/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <span>Смена</span>
                <span>{report?.shift === "day" ? "Дневная" : "Ночная"}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Погода</span>
                <span>{report?.weather}</span>
              </div>
            </div>
            <div className="glass-chip border border-white/15 bg-white/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <span>Ответственный</span>
                <span>{report?.foremanName}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Готовность</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
                  {report?.objectReadinessPercent ?? 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white">Выполненные работы</h3>
            <div className="space-y-2">
              {report?.works.map((work) => (
                <div key={work.id} className="glass-chip border border-white/15 bg-white/10 px-3 py-2">
                  <div className="flex items-center justify-between text-white">
                    <span className="font-medium">{work.type}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{work.readinessPercent ?? 0}%</span>
                  </div>
                  <div className="text-xs text-white/70">
                    {work.volume ?? "—"} {work.unit}
                  </div>
                  {work.comment ? (
                    <div className="text-xs text-white/60">{work.comment}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-chip border border-white/15 bg-white/10 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.12em] text-white/70">Ресурсы</div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Рабочие</span>
                  <span className="text-white">{report?.resources?.workersCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Техника</span>
                  <span className="text-white">{report?.resources?.machinesCount ?? 0}</span>
                </div>
              </div>
            </div>
            <div className="glass-chip border border-white/15 bg-white/10 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.12em] text-white/70">Комментарий</div>
              <div className="mt-2 text-white/80">{report?.comment}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white">Фото</h3>
            <div className="grid grid-cols-2 gap-3">
              {report?.photos.map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
                  <img src={photo.url} alt="Фото" className="h-32 w-full object-cover" />
                  {photo.comment ? (
                    <div className="px-3 py-2 text-xs text-white/70">{photo.comment}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </GlassPage>
  );
}
