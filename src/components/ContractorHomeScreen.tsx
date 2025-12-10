import React from "react";
import { Button } from "@/components/ui/button";
import { HeaderLogo } from "./HeaderLogo";
import { GreetingHeader } from "./GreetingHeader";
import { ObjectCard, ObjectCardProps } from "./ObjectCard";

export interface ContractorObject extends Omit<ObjectCardProps, "onClick"> {}

export interface ContractorHomeScreenProps {
  userName: string;
  objects: ContractorObject[];
  onOpenObject: (id: string) => void;
  onCreateReport: () => void;
  logoUrl?: string;
  logoLoaded?: boolean;
  logoReveal?: boolean;
  onLogoLoad?: () => void;
  activeTab?: "objects" | "reports";
  onTabChange?: (tab: "objects" | "reports") => void;
}

export function ContractorHomeScreen({
  userName,
  objects,
  onOpenObject,
  onCreateReport,
  logoUrl,
  logoLoaded,
  logoReveal,
  onLogoLoad,
  activeTab = "objects",
  onTabChange,
}: ContractorHomeScreenProps) {
  return (
    <div className="relative mx-auto w-full max-w-[760px] text-white">
      <div
        className="relative border border-white/15 shadow-[0_18px_54px_rgba(6,17,44,0.38)]"
        style={{
          borderRadius: "24px",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(26px)",
          padding: "20px 18px",
        }}
      >
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <HeaderLogo
                logoUrl={logoUrl || ""}
                logoLoaded={Boolean(logoLoaded)}
                logoReveal={Boolean(logoReveal)}
                onLoad={onLogoLoad || (() => {})}
              />

              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 shadow-[0_10px_24px_rgba(6,17,44,0.3)] backdrop-blur">
                {[
                  { key: "objects", label: "Мои объекты" },
                  { key: "reports", label: "Отчёты и доступ" },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => onTabChange?.(tab.key as "objects" | "reports")}
                      className={`min-w-[120px] rounded-full px-4 py-2 text-[12px] font-semibold transition ${
                        isActive
                          ? "bg-white/85 text-slate-900 shadow-[0_12px_28px_rgba(255,255,255,0.35)]"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <GreetingHeader userName={userName} />
          </div>

          <div className="flex flex-col gap-[14px]">
            {objects.map((object) => (
              <ObjectCard
                key={object.id}
                {...object}
                onClick={() => onOpenObject(object.id)}
              />
            ))}
          </div>

          <div className="space-y-3 pt-1 sm:pt-2">
            <div className="h-px w-full bg-white/15" />
            <Button
              className="w-full rounded-full bg-gradient-to-r from-[#48C6EF] via-[#52E5FF] to-[#84FAB0] px-4 py-3 text-[13px] font-semibold text-sky-950 shadow-[0_20px_60px_rgba(6,17,44,0.45)] transition hover:brightness-110"
              onClick={onCreateReport}
            >
              Создать отчёт
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
