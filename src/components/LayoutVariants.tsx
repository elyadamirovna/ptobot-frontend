import type { FC, ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section: FC<SectionProps> = ({ title, children }) => (
  <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
      {title}
    </h3>
    {children}
  </section>
);

/* ================= MINIMALIST ================= */

export const MinimalistLayout: FC = () => (
  <div className="flex min-h-[100dvh] flex-col gap-6 bg-slate-950 px-4 py-6 text-slate-50 overflow-x-hidden overflow-y-auto">
    <header className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-slate-400">
          Ежедневный отчёт
        </span>
        <h1 className="text-2xl font-semibold">PTObot</h1>
      </div>
      <button className="rounded-full bg-slate-100/10 px-4 py-2 text-xs font-medium text-slate-100">
        Свернуть
      </button>
    </header>

    <main className="flex flex-1 flex-col gap-4">
      <Section title="Данные по объекту">
        <div className="space-y-3 text-xs text-slate-200">
          <label className="flex flex-col gap-1">
            Проект
            <select className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-slate-50">
              <option>Склад №3</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Вид работ
            <select className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-slate-50">
              <option>Монтаж</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Дата
            <input
              type="date"
              className="rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </label>
        </div>
      </Section>

      <Section title="Отчёт">
        <textarea
          className="h-28 w-full resize-none rounded-xl border border-white/5 bg-slate-900 px-3 py-3 text-sm text-slate-50"
          placeholder="Ключевые задачи, материалы, техника..."
        />
      </Section>

      <Section title="Фото">
        <div className="flex items-center justify-between rounded-xl border border-dashed border-white/20 px-4 py-6 text-xs text-white/60">
          <span>Перетащите файлы или нажмите, чтобы выбрать</span>
          <button className="rounded-full bg-slate-100/10 px-3 py-1 text-xs text-slate-100">
            Выбрать
          </button>
        </div>
      </Section>
    </main>

    <footer className="flex flex-col gap-2 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <span>Прогресс отчёта</span>
        <span className="font-semibold text-slate-50">80%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-4/5 rounded-full bg-emerald-500" />
      </div>
      <button className="rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950">
        Отправить отчёт
      </button>
    </footer>
  </div>
);

/* ================= GLASSMORPHISM ================= */

export const GlassmorphismLayout: FC = () => (
  <div className="relative flex min-h-[100dvh] justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#161323] via-[#1b1a2e] to-[#0f0d1d] px-6 py-8 text-slate-100">
    <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
    <div className="pointer-events-none absolute right-[-12rem] top-1/3 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
    <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

    <div className="relative grid w-full max-w-5xl gap-6 md:grid-cols-[88px_1fr]">
      <aside className="hidden flex-col justify-between rounded-[2.25rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl md:flex">
        <div className="flex flex-col items-center gap-6 text-[11px] uppercase tracking-[0.35em] text-white/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 font-semibold text-white">
            PT
          </div>
          <div className="flex flex-col items-center gap-5 text-white/40">
            {[
              { icon: "🏠", active: false },
              { icon: "📈", active: true },
              { icon: "🗂", active: false },
              { icon: "⚙️", active: false },
            ].map(({ icon, active }, index) => (
              <span
                key={index}
                className={`grid h-11 w-11 place-items-center rounded-2xl border border-white/5 ${
                  active ? "bg-white/15 text-white" : "bg-white/5 text-white/50"
                }`}
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
        <button className="grid h-12 w-full place-items-center rounded-2xl border border-white/10 bg-white/10 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
          Logout
        </button>
      </aside>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-8 overflow-visible">
        {/* левая колонка */}
        {/* ... остальной код без изменений ... */}
      </div>
    </div>
  </div>
);

/* ================= CORPORATE STRICT ================= */

export const CorporateStrictLayout: FC = () => (
  <div className="flex min-h-[100dvh] flex-col bg-slate-100 text-slate-900 overflow-y-auto overflow-x-hidden">
    {/* ... остальной код без изменений ... */}
  </div>
);

export const layoutVariants = {
  MinimalistLayout,
  GlassmorphismLayout,
  CorporateStrictLayout,
};

export default layoutVariants;
