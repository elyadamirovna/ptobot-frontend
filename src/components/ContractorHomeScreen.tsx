import React from "react";
import { Button } from "@/components/ui/button";
import { ContractorObjectCard, ContractorObjectCardProps } from "@/components/ContractorObjectCard";
import "@/styles/contractor-home.css";

export type ContractorObject = Omit<ContractorObjectCardProps, "onClick">;

export interface ContractorHomeScreenProps {
  userName: string;
  objects: ContractorObject[];
  onOpenObject: (id: string) => void;
  onCreateReport: () => void;
}

export function ContractorHomeScreen({
  userName,
  objects,
  onOpenObject,
  onCreateReport,
}: ContractorHomeScreenProps) {
  return (
    <div className="ch-v1-container">
      <div className="ch-v1-hero">
        <div className="ch-v1-hero__text">
          <div className="ch-v1-pill">Подрядчик</div>
          <h1 className="ch-v1-title">Добрый день, {userName}</h1>
          <p className="ch-v1-subtitle">Ваши объекты в едином списке. Статусы всегда под рукой.</p>
        </div>
        <Button className="ch-v1-action-btn" onClick={onCreateReport}>
          Создать отчёт
        </Button>
      </div>

      <div className="ch-v1-list" aria-label="Список объектов подрядчика">
        {objects.map((object) => (
          <ContractorObjectCard key={object.id} {...object} onClick={() => onOpenObject(object.id)} />
        ))}
      </div>
    </div>
  );
}
