import React, { useCallback, useState } from "react";
import { LoginPhoneScreen } from "@/components/LoginPhoneScreen";
import { OtpCodeScreen } from "@/components/OtpCodeScreen";

interface AuthGateProps {
  apiUrl: string;
  onAuthenticated: (token: string) => void;
}

export function AuthGate({ apiUrl, onAuthenticated }: AuthGateProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState<string | null>(null);
  const [resendAfterSec, setResendAfterSec] = useState<number | null>(null);

  const requestOtp = useCallback(
    async (normalizedPhone: string) => {
      try {
        const res = await fetch(`${apiUrl}/auth/otp/request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone: normalizedPhone }),
        });

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error("Слишком часто. Попробуйте позже");
          }
          throw new Error("Не удалось отправить код");
        }

        const data = await res.json().catch(() => null);
        return typeof data?.resend_after_sec === "number"
          ? data.resend_after_sec
          : null;
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error("Нет соединения");
        }
        throw error;
      }
    },
    [apiUrl]
  );

  const verifyOtp = useCallback(
    async (normalizedPhone: string, code: string) => {
      try {
        const res = await fetch(`${apiUrl}/auth/otp/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone: normalizedPhone, code }),
        });

        if (!res.ok) {
          if (res.status === 400) {
            throw new Error("Неверный код");
          }
          if (res.status === 410) {
            throw new Error("Код истёк");
          }
          if (res.status === 423) {
            throw new Error("Слишком много попыток");
          }
          if (res.status === 429) {
            throw new Error("Слишком часто. Попробуйте позже");
          }
          throw new Error("Не удалось подтвердить код");
        }

        const data = await res.json().catch(() => null);
        const token = data?.access_token;
        if (!token) {
          throw new Error("Не удалось войти");
        }

        onAuthenticated(token);
        return token as string;
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error("Нет соединения");
        }
        throw error;
      }
    },
    [apiUrl, onAuthenticated]
  );

  if (step === "otp" && phone) {
    return (
      <OtpCodeScreen
        phone={phone}
        resendAfterSec={resendAfterSec}
        onResend={async () => {
          const nextResend = await requestOtp(phone);
          setResendAfterSec(nextResend);
          return nextResend;
        }}
        onVerify={(code) => verifyOtp(phone, code)}
        onChangePhone={() => setStep("phone")}
      />
    );
  }

  return (
    <LoginPhoneScreen
      onRequestOtp={requestOtp}
      onSuccess={(normalizedPhone, nextResend) => {
        setPhone(normalizedPhone);
        setResendAfterSec(nextResend);
        setStep("otp");
      }}
    />
  );
}
