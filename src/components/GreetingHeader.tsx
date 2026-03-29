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
    <div className="flex flex-col gap-3">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
        {roleLabel}
      </span>

      <div className="space-y-1.5">
        <p className="text-[22px] font-bold leading-[1.15] tracking-[-0.02em] text-white">
          Добрый день,{" "}
          <span className="text-white/60">{userName}</span>
        </p>
        <p className="text-[13px] font-medium leading-snug text-white/50">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
