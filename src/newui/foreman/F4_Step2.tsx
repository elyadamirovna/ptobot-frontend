import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { useForemanReport } from "../components/ForemanReportContext";

export default function F4_Step2() {
  const navigate = useNavigate();
  const { draft, addWork, removeWork } = useForemanReport();
  const [type, setType] = useState("");
  const [volume, setVolume] = useState<string>("");
  const [unit, setUnit] = useState("м³");
  const [readiness, setReadiness] = useState<string>("");

  const handleAdd = () => {
    if (!type) return;
    addWork({
      id: crypto.randomUUID(),
      type,
      volume: volume ? Number(volume) : undefined,
      unit,
      readinessPercent: readiness ? Number(readiness) : undefined,
    });
    setType("");
    setVolume("");
    setReadiness("");
  };

  return (
    <GlassPage title="Шаг 2: Виды работ" subtitle="Укажите выполненные работы и объёмы">
      <Card className="glass-card border-white/15 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Работы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/80">
          <div className="grid gap-3 sm:grid-cols-4">
            <Input
              placeholder="Тип работ"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="glass-input border-white/20 bg-white/10 text-white"
            />
            <Input
              placeholder="Объём"
              value={volume}
              type="number"
              onChange={(e) => setVolume(e.target.value)}
              className="glass-input border-white/20 bg-white/10 text-white"
            />
            <Input
              placeholder="Ед. изм"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="glass-input border-white/20 bg-white/10 text-white"
            />
            <Input
              placeholder="Готовность %"
              value={readiness}
              type="number"
              onChange={(e) => setReadiness(e.target.value)}
              className="glass-input border-white/20 bg-white/10 text-white"
            />
          </div>
          <Button variant="secondary" onClick={handleAdd} className="w-full sm:w-auto">
            Добавить работу
          </Button>

          <div className="space-y-3">
            {draft.works.map((work) => (
              <div
                key={work.id}
                className="glass-chip flex items-center justify-between border border-white/15 bg-white/10 px-4 py-3 text-white"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{work.type}</span>
                  <span className="text-sm text-white/70">
                    {work.volume ?? "—"} {work.unit} • Готовность {work.readinessPercent ?? 0}%
                  </span>
                </div>
                <Button size="sm" variant="ghost" className="border border-white/15" onClick={() => removeWork(work.id)}>
                  Удалить
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="ghost" className="border border-white/15" onClick={() => navigate("/foreman/new")}>Назад</Button>
            <Button variant="secondary" onClick={() => navigate("/foreman/new/resources")}>Далее</Button>
          </div>
        </CardContent>
      </Card>
    </GlassPage>
  );
}
