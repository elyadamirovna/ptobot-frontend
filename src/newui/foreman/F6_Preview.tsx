import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { useForemanReport } from "../components/ForemanReportContext";
import { mockProjects } from "../components/mockData";

export default function F6_Preview() {
  const navigate = useNavigate();
  const { draft } = useForemanReport();
  const project = mockProjects.find((item) => item.id === draft.projectId);

  const handleSend = () => {
    navigate("/foreman/new/sent");
  };

  return (
    <GlassPage title="Шаг 4: Предпросмотр" subtitle="Проверьте данные перед отправкой">
      <Card className="glass-card border-white/15 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Предпросмотр отчёта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/80">
          <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <span>Объект</span>
              <span className="text-white">{project?.name}</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Дата</span>
              <span>{draft.date}</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Смена</span>
              <span>{draft.shift === "day" ? "Дневная" : "Ночная"}</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Погода</span>
              <span>{draft.weather || "—"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white">Работы</h3>
            <div className="space-y-2">
              {draft.works.map((work) => (
                <div key={work.id} className="glass-chip border border-white/15 bg-white/10 px-3 py-2">
                  <div className="flex items-center justify-between text-white">
                    <span className="font-medium">{work.type}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                      {work.readinessPercent ?? 0}%
                    </span>
                  </div>
                  <div className="text-xs text-white/70">
                    {work.volume ?? "—"} {work.unit}
                  </div>
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
                  <span className="text-white">{draft.resources?.workersCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Техника</span>
                  <span className="text-white">{draft.resources?.machinesCount ?? 0}</span>
                </div>
              </div>
            </div>
            <div className="glass-chip border border-white/15 bg-white/10 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.12em] text-white/70">Готовность</div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Объект</span>
                  <span className="text-white">{draft.objectReadinessPercent ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ответственный</span>
                  <span className="text-white">{draft.foremanName || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.12em] text-white/70">Комментарий</div>
            <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white/80">
              {draft.comment || "Нет комментариев"}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="ghost" className="border border-white/15" onClick={() => navigate("/foreman/new/resources")}>
              Назад
            </Button>
            <Button variant="secondary" onClick={handleSend}>Отправить</Button>
          </div>
        </CardContent>
      </Card>
    </GlassPage>
  );
}
