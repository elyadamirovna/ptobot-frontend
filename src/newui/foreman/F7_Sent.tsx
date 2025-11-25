import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassPage } from "../components/GlassPage";
import { useForemanReport } from "../components/ForemanReportContext";

export default function F7_Sent() {
  const navigate = useNavigate();
  const { resetDraft } = useForemanReport();

  useEffect(() => {
    resetDraft();
  }, [resetDraft]);

  return (
    <GlassPage title="Отчёт отправлен" subtitle="Данные успешно переданы руководителю">
      <Card className="glass-card border-white/15 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Спасибо!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/80">
          <p className="text-white/80">
            Отчёт успешно сохранён и доступен для просмотра. Вы можете создать новый или вернуться к списку объектов.
          </p>
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" className="border border-white/15" onClick={() => navigate("/foreman")}>На главную</Button>
            <Button variant="secondary" onClick={() => navigate("/foreman/new")}>Создать новый</Button>
          </div>
        </CardContent>
      </Card>
    </GlassPage>
  );
}
