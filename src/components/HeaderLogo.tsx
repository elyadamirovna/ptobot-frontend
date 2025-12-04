import React from "react";

interface HeaderLogoProps {
  logoUrl: string;
  logoLoaded: boolean;
  logoReveal: boolean;
  onLoad: () => void;
}

export function HeaderLogo({ logoUrl, logoLoaded, logoReveal, onLoad }: HeaderLogoProps) {
  return (
    <div
      className={`
        flex h-12 w-36 items-center justify-center overflow-hidden
        rounded-2xl bg-white/20
        transition-all duration-1000 ease-out delay-100
        ${logoReveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Логотип компании"
          className={`
            h-full w-full object-contain transform-gpu transition-all duration-1000 ease-out
            ${logoLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-[6px]"}
          `}
          onLoad={onLoad}
        />
      ) : (
        <span>Лого</span>
      )}
    </div>
  );
}
