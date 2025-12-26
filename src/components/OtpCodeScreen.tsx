import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OtpCodeScreenProps {
  phone: string;
  resendAfterSec: number | null;
  onResend: () => Promise<number | null>;
  onVerify: (code: string) => Promise<string>;
  onChangePhone: () => void;
}

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  const safe = digits.startsWith("7") ? digits : `7${digits}`;
  const payload = safe.slice(1).padEnd(10, "*");
  const start = payload.slice(0, 3);
  const end = payload.slice(8, 10);
  return `+7 ${start} *** ** ${end}`;
};

const formatTimer = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function OtpCodeScreen({
  phone,
  resendAfterSec,
  onResend,
  onVerify,
  onChangePhone,
}: OtpCodeScreenProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(resendAfterSec ?? 0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setResendSeconds(resendAfterSec ?? 0);
  }, [resendAfterSec]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const code = useMemo(() => digits.join(""), [digits]);
  const isComplete = digits.every((digit) => digit.length === 1);

  const applyDigits = (startIndex: number, incoming: string) => {
    const next = [...digits];
    let index = startIndex;
    incoming.split("").forEach((char) => {
      if (index >= next.length) return;
      next[index] = char;
      index += 1;
    });
    setDigits(next);
    const nextFocus = Math.min(startIndex + incoming.length, next.length - 1);
    inputsRef.current[nextFocus]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const filtered = value.replace(/\D/g, "");
    if (!filtered) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    if (filtered.length > 1) {
      applyDigits(index, filtered.slice(0, 4 - index));
      return;
    }

    const next = [...digits];
    next[index] = filtered;
    setDigits(next);
    if (index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && digits[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pasted = event.clipboardData.getData("text");
    const filtered = pasted.replace(/\D/g, "");
    if (!filtered) return;
    event.preventDefault();
    applyDigits(index, filtered.slice(0, 4 - index));
  };

  const handleVerify = async () => {
    if (!isComplete || loading) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Нет соединения");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onVerify(code);
    } catch (verifyError) {
      if (verifyError instanceof Error) {
        setError(verifyError.message);
      } else {
        setError("Не удалось подтвердить код");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || resendLoading) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Нет соединения");
      return;
    }

    setResendLoading(true);
    setError(null);

    try {
      const nextResend = await onResend();
      setResendSeconds(nextResend ?? 0);
    } catch (resendError) {
      if (resendError instanceof Error) {
        setError(resendError.message);
      } else {
        setError("Не удалось отправить код");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative rounded-[32px] px-4 pb-10 pt-6 sm:rounded-[44px] sm:px-6 sm:pb-12 sm:pt-7">
      <div className="glass-grid-overlay" />
      <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
        <CardContent className="space-y-6 pt-6 text-[12px] sm:p-7 sm:pt-6 sm:text-[13px]">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
              Код из SMS
            </p>
            <p className="text-[13px] text-white/75 sm:text-[14px]">
              Мы отправили код на {maskPhone(phone)}
            </p>
          </div>

          <div className="flex gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  inputsRef.current[index] = node;
                }}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPaste={(event) => handlePaste(event, index)}
                inputMode="numeric"
                maxLength={1}
                className="h-12 w-12 rounded-2xl border border-white/20 bg-white/10 text-center text-[18px] font-semibold text-white/90 shadow-[0_16px_38px_rgba(7,24,74,0.45)] focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            ))}
          </div>

          {error && (
            <p className="text-[11px] font-medium text-amber-200/90 sm:text-[12px]">{error}</p>
          )}

          <Button
            type="button"
            className="h-11 w-full rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-6 text-[12px] font-semibold text-sky-900 shadow-[0_24px_60px_rgba(3,144,255,0.85)] hover:brightness-110 disabled:opacity-60 sm:text-[13px]"
            onClick={handleVerify}
            disabled={!isComplete || loading}
          >
            {loading ? "Проверяем…" : "Войти"}
          </Button>

          <div className="flex flex-col items-center gap-2 text-[12px] text-white/70 sm:text-[13px]">
            {resendSeconds > 0 ? (
              <span>Отправить код ещё раз через {formatTimer(resendSeconds)}</span>
            ) : (
              <Button
                type="button"
                variant="link"
                className="h-auto text-[12px] text-white/80 hover:text-white sm:text-[13px]"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? "Отправляем…" : "Отправить ещё раз"}
              </Button>
            )}

            <Button
              type="button"
              variant="link"
              className="h-auto text-[12px] text-white/60 hover:text-white sm:text-[13px]"
              onClick={onChangePhone}
            >
              Изменить номер
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
