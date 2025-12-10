import React from "react";
import "@/styles/home.css";

interface HeroBlockProps {
  userName: string;
  subtitle: string;
  activeCount: number;
}

export default function HeroBlock({ userName, subtitle, activeCount }: HeroBlockProps) {
  return (
    <div className="hero-block">
      <div className="greeting">Добрый день, {userName}</div>
      <div className="subtitle">{subtitle}</div>
      <div className="status-badge">Активных объектов: {activeCount}</div>
    </div>
  );
}
