import React from "react";

interface StepperProps {
  label: string;
  value: number;
  min?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function Stepper({
  label,
  value,
  min = 0,
  disabled = false,
  onChange,
}: StepperProps) {
  const canDecrement = value > min && !disabled;

  return (
    <div className="flex items-center justify-between rounded-3xl border border-white/20 bg-white/10 px-4 py-3">
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-lg font-semibold text-white/90 transition hover:bg-white/20 disabled:opacity-50"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={!canDecrement}
        >
          –
        </button>
        <span className="min-w-[40px] text-center text-[16px] font-semibold text-white">
          {value}
        </span>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-lg font-semibold text-white/90 transition hover:bg-white/20"
          onClick={() => onChange(value + 1)}
          disabled={disabled}
        >
          +
        </button>
      </div>
    </div>
  );
}
