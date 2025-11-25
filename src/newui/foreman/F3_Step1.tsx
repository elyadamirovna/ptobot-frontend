import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { mockProjects } from "../components/mockData";
import { useForemanReport } from "../components/ForemanReportContext";

export default function F3_Step1() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { draft, updateDraft } = useForemanReport();

  React.useEffect(() => {
    const projectFromQuery = searchParams.get("project");
    if (projectFromQuery) {
      updateDraft({ projectId: projectFromQuery });
    }
  }, [searchParams, updateDraft]);

  return (
    <GlassPage title="Шаг 1: Общие данные" subtitle="Выберите объект, дату, смену и погодные условия">
      <Card className="glass-card border-white/15 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Основные параметры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/80">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.12em] text-white/70">Объект</span>
            <Select value={draft.projectId} onValueChange={(value) => updateDraft({ projectId: value })}>
              <SelectTrigger className="glass-input border-white/20 bg-white/10 text-white">
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent className="glass-popover">
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.12em] text-white/70">Дата</span>
              <Input
                type="date"
                value={draft.date}
                onChange={(e) => updateDraft({ date: e.target.value })}
                className="glass-input border-white/20 bg-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.12em] text-white/70">Смена</span>
              <Select value={draft.shift} onValueChange={(value) => updateDraft({ shift: value as "day" | "night" })}>
                <SelectTrigger className="glass-input border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder="Выберите смену" />
                </SelectTrigger>
                <SelectContent className="glass-popover">
                  <SelectItem value="day">Дневная</SelectItem>
                  <SelectItem value="night">Ночная</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.12em] text-white/70">Погода</span>
            <Input
              placeholder="Например, +12°С, ясно"
              value={draft.weather || ""}
              onChange={(e) => updateDraft({ weather: e.target.value })}
              className="glass-input border-white/20 bg-white/10 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" className="border border-white/15" onClick={() => navigate(-1)}>
              Назад
            </Button>
            <Button variant="secondary" onClick={() => navigate("/foreman/new/works")}>Далее</Button>
          </div>
        </CardContent>
      </Card>
    </GlassPage>
  );
}
