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

/* ============================================================
   MINIMALIST LAYOUT — FIXED
   ============================================================ */

export const MinimalistLayout: FC = () => (
  <div className="flex h-[100dvh] flex-col gap-6 bg-slate-950 px-4 py-6 text-slate-50 overflow-x-hidden overflow-y-auto">
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
            <select className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-base text-slate-50">
              <option>Склад №3</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Вид работ
            <select className="w-full rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-base text-slate-50">
              <option>Монтаж</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Дата
            <input
              type="date"
              className="rounded-lg border border-white/5 bg-slate-900 px-3 py-2 text-base text-slate-50"
            />
          </label>
        </div>
      </Section>

      <Section title="Отчёт">
        <textarea
          className="h-28 w-full resize-none rounded-xl border border-white/5 bg-slate-900 px-3 py-3 text-base text-slate-50"
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


/* ============================================================
   GLASSMORPHISM LAYOUT — FIXED
   ============================================================ */

export const GlassmorphismLayout: FC = () => (
  <div className="relative flex h-[100dvh] justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#161323] via-[#1b1a2e] to-[#0f0d1d] px-6 py-8 text-slate-100">

    {/* decorative blur layers — pointer-events-none обязательно! */}
    <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
    <div className="pointer-events-none absolute right-[-12rem] top-1/3 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
    <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

    <div className="relative grid w-full max-w-5xl gap-6 md:grid-cols-[88px_1fr]">

      {/* sidebar corrected */}
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

      {/* MAIN CONTENT SCROLLABLE */}
      <div className="flex flex-col gap-6 md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-8 overflow-visible">

        {/* left column */}
        <div className="space-y-6">

          {/* HEADER */}
          <header className="flex flex-col gap-4 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/15 via-white/10 to-transparent p-6 backdrop-blur-2xl md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">Channel Analytics</p>
                <h1 className="text-3xl font-semibold text-white md:text-4xl">Оптимизируйте свои отчёты</h1>
              </div>
              <button className="self-start rounded-full bg-gradient-to-r from-fuchsia-400/80 via-rose-400/80 to-amber-300/80 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-rose-400/20">
                Создать отчёт
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
                  alt="manager"
                  className="h-32 w-full object-cover md:h-40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-white/80">
                {["76k", "1.5m", "$3.6k", "47"].map((value, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-white/10 bg-white/10 p-4 text-sm"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                      {index === 0
                        ? "Сделки"
                        : index === 1
                        ? "Просмотры"
                        : index === 2
                        ? "Доход"
                        : "Сессии"}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* STATS SECTION */}
          <section className="grid gap-6 rounded-[2.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl md:grid-cols-[1.1fr_0.9fr] md:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Активные работы</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">Сегодня</span>
              </div>

              <div className="h-40 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4">
                <div className="flex h-full items-end justify-between text-[10px] uppercase tracking-[0.3em] text-white/40">
                  {[
                    { day: "Пн", value: 68 },
                    { day: "Вт", value: 72 },
                    { day: "Ср", value: 56 },
                    { day: "Чт", value: 82 },
                    { day: "Пт", value: 74 },
                    { day: "Сб", value: 45 },
                    { day: "Вс", value: 38 },
                  ].map(({ day, value }) => (
                    <div key={day} className="flex h-full flex-1 flex-col items-center">
                      <span className="mb-2 text-white/70">{value}%</span>
                      <div className="relative flex h-full w-2 items-end rounded-full bg-white/15">
                        <div
                          className="w-full rounded-full bg-gradient-to-t from-amber-300 via-rose-400 to-fuchsia-500"
                          style={{ height: `${value}%` }}
                        />
                      </div>
                      <span className="mt-2">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Последние отчёты</h2>
                <button className="text-xs uppercase tracking-[0.3em] text-white/60">Смотреть все</button>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    <div>
                      <p className="font-medium">Отчёт #{100 + item}</p>
                      <p className="text-xs text-white/50">Монтаж / 12 июля</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-300">Готов</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ADDITIONAL INFO */}
          <section className="rounded-[2.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">Соберите отчёт за 3 шага</h2>
                <p className="max-w-xs text-sm text-white/70">
                  Выберите проект, укажите объём выполненных работ и прикрепите подтверждающие материалы.
                </p>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                {[
                  { title: "Шаг 1", description: "Объект, дата и вид работ" },
                  { title: "Шаг 2", description: "Описание задач и ресурсы" },
                  { title: "Шаг 3", description: "Фото, файлы и подтверждение" },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-400/40 to-cyan-300/30 text-sm font-semibold text-white">
                      {step.title}
                    </span>

                    <div>
                      <p className="font-semibold text-white">{step.description}</p>
                      <p className="text-xs text-white/50">2 мин</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          <div className="rounded-[2.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Статус отчётов</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">Неделя</span>
            </div>

            <div className="mt-6 space-y-3 text-sm text-white/80">
              {["Монтаж", "Отделка", "Техника"].map((category, index) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>{category}</span>
                    <span className="text-xs text-white/50">{70 - index * 12}%</span>
                  </div>

                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-rose-400 to-amber-300"
                      style={{ width: `${70 - index * 12}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[2.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl md:p-8">
            <h2 className="text-lg font-semibold">Уведомления</h2>

            <div className="space-y-3 text-sm text-white/80">
              {["Новый объект добавлен", "Отчёт принят", "Новый комментарий"].map((note, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{note}</p>
                    <p className="text-xs text-white/40">
                      {index === 0 ? "5 мин назад" : index === 1 ? "1 час назад" : "2 часа назад"}
                    </p>
                  </div>

                  <button className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
                    Смотреть
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-transparent p-6 text-center backdrop-blur-2xl md:p-8">
            <h2 className="text-2xl font-semibold">Веб-приложение готово</h2>
            <p className="mt-3 text-sm text-white/70">
              Подключайтесь и получайте отчёты в реальном времени.
            </p>

            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-rose-400 to-amber-300 px-6 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-rose-400/25">
              Начать работу
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);


/* ============================================================
   CORPORATE STRICT LAYOUT — FIXED
   ============================================================ */

export const CorporateStrictLayout: FC = () => (
  <div className="flex h-[100dvh] flex-col bg-slate-100 text-slate-900 overflow-y-auto overflow-x-hidden">

    <header className="border-b border-slate-200 bg-white/90 px-5 py-4">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between">

        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            PTObot Construction Control
          </span>
          <h1 className="text-xl font-semibold text-slate-900">Дневной отчёт</h1>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium">
            История
          </button>
          <button className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium">
            Доступы
          </button>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-wide text-slate-400">
              Ответственный
            </span>
            <span className="text-sm font-semibold">ИП «Строитель»</span>
          </div>
        </div>

      </div>
    </header>

    <main className="mx-auto grid w-full max-w-3xl flex-1 gap-4 bg-slate-50 px-5 py-6 md:grid-cols-[240px_1fr]">
      <aside className="space-y-4">

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Объект
          </h2>
          <select className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base">
            <option>Складской комплекс №3</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Вид работ
          </h2>
          <select className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base">
            <option>Монтаж металлоконструкций</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Дата
          </h2>
          <input
            type="date"
            className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base"
          />
        </div>

      </aside>

      <section className="flex flex-col gap-4">

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Структура отчёта</h2>
            <span className="text-xs text-slate-500">День: 12.07.2024</span>
          </div>

          <textarea
            className="min-h-[140px] resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-base"
            placeholder="Кратко опишите выполненные операции, материалы и технику"
          />

          <div className="grid gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
            <span>Прикрепите фотоотчёт и акты выполненных работ</span>
            <button className="self-start rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700">
              Загрузить файлы
            </button>
          </div>
        </div>

        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>Готовность отчёта</span>
            <span className="font-semibold text-slate-900">72%</span>
          </div>

          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-full w-[72%] rounded-full bg-slate-800" />
          </div>

          <div className="flex items-center justify-end gap-3 text-xs">
            <button className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700">
              Сохранить черновик
            </button>
            <button className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white">
              Отправить отчёт
            </button>
          </div>

        </div>

      </section>
    </main>
  </div>
);
