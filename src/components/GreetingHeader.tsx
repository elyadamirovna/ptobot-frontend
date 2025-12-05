import React from "react";

interface GreetingHeaderProps {
  userName: string;
  roleLabel?: string;
  subtitle?: string;
}

export function GreetingHeader({
  userName,
  roleLabel = "Подрядчик",
  subtitle = "Объекты под вашим контролем",
}: GreetingHeaderProps) {
  return (
    <div className="flex flex-col gap-2 text-white">
      <div className="space-y-1">
        <p className="text-[15px] font-semibold leading-[1.2]">Добрый день, {userName}</p>
        <p className="text-[13px] text-white/80">{subtitle}</p>
      </div>
      <span
        className="inline-flex w-fit items-center gap-1 rounded-[12px] border border-white/20 bg-white/10 px-[10px] py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90"
      >
        {roleLabel}
      </span>
    </div>
  );
}
