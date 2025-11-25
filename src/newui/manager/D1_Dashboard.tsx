import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { mockProjects, mockReports } from "../components/mockData";

export default function D1_Dashboard() {
  const navigate = useNavigate();
  const activeReports = mockReports.length;

  return (
    <GlassPage
      title="Панель руководителя"
      subtitle="Контроль объектов и статусов"
      actions={<Button variant="secondary" onClick={() => navigate("/foreman?role=manager")}>Открыть режим прораба</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.12em] text-white/70">Активные отчёты</div>
          <div className="text-2xl font-semibold text-white">{activeReports}</div>
        </div>
        <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.12em] text-white/70">Объекты</div>
          <div className="text-2xl font-semibold text-white">{mockProjects.length}</div>
        </div>
        <div className="glass-chip border border-white/20 bg-white/10 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.12em] text-white/70">Просрочено</div>
          <div className="text-2xl font-semibold text-white">1</div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {mockProjects.map((project) => (
          <Card key={project.id} className="glass-card border-white/20 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <Button size="sm" variant="ghost" className="border border-white/15" onClick={() => navigate(`/manager/project/${project.id}`)}>
                Перейти
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span>Адрес</span>
                <span className="text-right text-white/60">{project.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Готовность</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{project.readinessPercent ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Статус</span>
                <span className="text-white/70">{project.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </GlassPage>
  );
}
