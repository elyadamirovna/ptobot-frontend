import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginPhoneScreenProps {
  onRequestOtp: (phone: string) => Promise<number | null>;
  onSuccess: (phone: string, resendAfterSec: number | null) => void;
}

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "7";
  let normalized = digits.startsWith("8")
    ? `7${digits.slice(1)}`
    : digits;
  if (!normalized.startsWith("7")) {
    normalized = `7${normalized}`;
  }
  return normalized.slice(0, 11);
};

const formatPhoneMask = (digits: string) => {
  const normalized = normalizePhone(digits);
  const payload = normalized.slice(1).padEnd(10, "_");
  const part1 = payload.slice(0, 3);
  const part2 = payload.slice(3, 6);
  const part3 = payload.slice(6, 8);
  const part4 = payload.slice(8, 10);
  return `+7 (${part1}) ${part2}-${part3}-${part4}`;
};

export function LoginPhoneScreen({ onRequestOtp, onSuccess }: LoginPhoneScreenProps) {
  const [phoneDigits, setPhoneDigits] = useState("7");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formattedPhone = useMemo(
    () => formatPhoneMask(phoneDigits),
    [phoneDigits]
  );
  const isValid = phoneDigits.length === 11;

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Нет соединения");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedPhone = `+${phoneDigits}`;
      const resendAfterSec = await onRequestOtp(normalizedPhone);
      onSuccess(normalizedPhone, resendAfterSec);
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("Не удалось отправить код");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-[32px] px-4 pb-10 pt-6 sm:rounded-[44px] sm:px-6 sm:pb-12 sm:pt-7">
      <div className="glass-grid-overlay" />
      <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
        <CardContent className="space-y-6 pt-6 text-[12px] sm:p-7 sm:pt-6 sm:text-[13px]">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
              Вход в систему
            </p>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Введите номер телефона</h1>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
              Телефон
            </label>
            <Input
              type="tel"
              value={formattedPhone}
              onChange={(event) => {
                setPhoneDigits(normalizePhone(event.target.value));
                if (error) setError(null);
              }}
              inputMode="tel"
              className="h-11 rounded-2xl border border-white/20 bg-white/10 text-[14px] text-white/90 placeholder:text-white/50 shadow-[0_16px_38px_rgba(7,24,74,0.45)]"
              placeholder="+7 (___) ___-__-__"
            />
          </div>

          {error && (
            <p className="text-[11px] font-medium text-amber-200/90 sm:text-[12px]">{error}</p>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              className="h-11 w-full rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-6 text-[12px] font-semibold text-sky-900 shadow-[0_24px_60px_rgba(3,144,255,0.85)] hover:brightness-110 disabled:opacity-60 sm:text-[13px]"
              onClick={handleSubmit}
              disabled={!isValid || loading}
            >
              {loading ? "Отправляем…" : "Получить код"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="h-auto w-full text-[12px] text-white/70 hover:text-white sm:text-[13px]"
            >
              Войти через Telegram
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
