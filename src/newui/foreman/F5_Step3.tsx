import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { useForemanReport } from "../components/ForemanReportContext";

export default function F5_Step3() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useForemanReport();

  return (
    <GlassPage title="Шаг 3: Ресурсы" subtitle="Заполните ресурсы, комментарии и ответственное лицо">
      <Card className="glass-card border-white/15 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Ресурсы и комментарии</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/80">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.12em] text-white/70">Рабочие</span>
              <Input
                type="number"
                value={draft.resources?.workersCount ?? ""}
                onChange={(e) =>
                  updateDraft({ resources: { ...draft.resources, workersCount: Number(e.target.value) } })
                }
                className="glass-input border-white/20 bg-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.12em] text-white/70">Техника</span>
              <Input
                type="number"
                value={draft.resources?.machinesCount ?? ""}
                onChange={(e) =>
                  updateDraft({ resources: { ...draft.resources, machinesCount: Number(e.target.value) } })
                }
                className="glass-input border-white/20 bg-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.12em] text-white/70">Комментарий</span>
            <Textarea
              placeholder="Описание хода работ, проблемы, планы"
              value={draft.comment || ""}
              onChange={(e) => updateDraft({ comment: e.target.value })}
              className="glass-input min-h-[120px] border-white/20 bg-white/10 text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.12em] text-white/70">Имя прораба</span>
              <Input
                placeholder="ФИО"
                value={draft.foremanName || ""}
                onChange={(e) => updateDraft({ foremanName: e.target.value })}
                className="glass-input border-white/20 bg-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.12em] text-white/70">Готовность объекта</span>
              <Input
                type="number"
                value={draft.objectReadinessPercent ?? ""}
                onChange={(e) => updateDraft({ objectReadinessPercent: Number(e.target.value) })}
                className="glass-input border-white/20 bg-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="ghost" className="border border-white/15" onClick={() => navigate("/foreman/new/works")}>Назад</Button>
            <Button variant="secondary" onClick={() => navigate("/foreman/new/preview")}>Далее</Button>
          </div>
        </CardContent>
      </Card>
    </GlassPage>
  );
}
