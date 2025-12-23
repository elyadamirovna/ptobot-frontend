import React, { RefObject, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Building2,
  HardHat,
  Users,
  Image as ImageIcon,
  Upload,
  ChevronDown,
  History as HistoryIcon,
  X,
} from "lucide-react";
import { HistoryRow } from "@/types/app";
import { formatRu, toOneLine } from "@/utils/format";

interface DashboardScreenProps {
  projects: { id: string; name: string; address: string }[];
  workTypes: { id: string; name: string }[];
  history: HistoryRow[];
  project: string | undefined;
  workType: string | undefined;
  date: string;
  volume: string;
  machines: string;
  people: string;
  comment: string;
  previews: string[];
  fileValidationMessage: string | null;
  sending: boolean;
  progress: number;
  requiredHintVisible: boolean;
  onProjectChange: (value: string) => void;
  onWorkTypeChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onVolumeChange: (value: string) => void;
  onMachinesChange: (value: string) => void;
  onPeopleChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onPickFiles: () => void;
  onClearFiles: () => void;
  onSendReport: () => void;
  onFilesSelected: React.ChangeEventHandler<HTMLInputElement>;
  swipeAreaRef: RefObject<HTMLDivElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  hasFiles: boolean;
  isFormReady: boolean;
  missingFields: string[];
  onBack: () => void;
  onClose: () => void;
}

export function DashboardScreen({
  projects,
  workTypes,
  history,
  project,
  workType,
  date,
  volume,
  machines,
  people,
  comment,
  previews,
  fileValidationMessage,
  sending,
  progress,
  requiredHintVisible,
  onProjectChange,
  onWorkTypeChange,
  onDateChange,
  onVolumeChange,
  onMachinesChange,
  onPeopleChange,
  onCommentChange,
  onPickFiles,
  onClearFiles,
  onSendReport,
  onFilesSelected,
  swipeAreaRef,
  fileInputRef,
  hasFiles,
  isFormReady,
  missingFields,
  onBack,
  onClose,
}: DashboardScreenProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const selectedProject = projects.find((item) => item.id === project);
  const projectName = selectedProject?.name ?? "Объект";
  const formattedDate = formatRu(date);

  const historyContent = (
    <div className="space-y-6 text-[11px] sm:text-[12px]">
      <div className="grid gap-3 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">Объект</p>
            <Select value={project} onValueChange={onProjectChange}>
              <SelectTrigger className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]">
                <SelectValue placeholder="Объект" />
              </SelectTrigger>
              <SelectContent className="border border-white/15 bg-[#07132F]/95 text-white">
                {projects.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">С даты</p>
            <Input type="date" className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">По дату</p>
            <Input type="date" className="h-9 rounded-2xl border border-white/20 bg-white/10 text-[11px] text-white/90 sm:text-[12px]" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {history
          .filter((item) => !project || item.project_id === project)
          .map((item) => (
            <div
              key={item.id}
              className="rounded-[22px] border border-white/12 bg-white/8 p-4 text-white/85 shadow-[0_14px_36px_rgba(6,17,44,0.35)] backdrop-blur"
            >
              <div className="flex flex-col gap-1 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:text-[12px]">
                <span>{formatRu(item.date)}</span>
                <span className="text-white/75">
                  {projects.find((proj) => proj.id === item.project_id)?.name ?? "Объект"}
                  <span className="mx-1 text-white/40">•</span>
                  {workTypes.find((type) => type.id === item.work_type_id)?.name ?? "Вид работ"}
                </span>
              </div>
              <div className="mt-2 text-[12px] text-white/90 sm:text-[13px]">{toOneLine(item.description)}</div>
              <div className="mt-3 flex gap-2 overflow-hidden rounded-2xl">
                {item.photos.map((photo, index) => (
                  <img
                    key={`${item.id}-${index}`}
                    src={photo}
                    alt="Фото отчёта"
                    className="h-20 w-full max-w-[120px] rounded-xl object-cover shadow-[0_10px_28px_rgba(6,17,44,0.35)]"
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="relative rounded-[32px] px-4 pb-24 pt-6 sm:rounded-[44px] sm:px-6 sm:pb-28 sm:pt-7 lg:rounded-[52px] lg:px-8 lg:pb-32 lg:pt-8">
      <div className="glass-grid-overlay" />
      <div className="relative" ref={swipeAreaRef}>
        <div className="mb-5 flex items-start justify-between gap-3 text-white sm:mb-6">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 shadow-[0_12px_30px_rgba(6,17,44,0.35)] transition hover:text-white sm:text-[12px]"
          >
            <span className="text-[12px] sm:text-[13px]">✕</span>
            Закрыть
          </button>
          <div className="flex flex-1 flex-col items-center text-center">
            <span className="text-[14px] font-semibold text-white sm:text-[15px]">{projectName}</span>
            <span className="text-[11px] text-white/70 sm:text-[12px]">Сегодня · {formattedDate}</span>
          </div>
          <div className="w-[86px]" aria-hidden />
        </div>
        <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
          <CardContent className="space-y-6 pt-6 text-[12px] sm:p-7 sm:pt-6 sm:text-[13px]">
                <div className="grid gap-3 rounded-3xl border border-white/20 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                      Объект
                    </p>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                      <Input
                        readOnly
                        value={projectName}
                        className="h-11 rounded-2xl border border-white/20 bg-white/10 pl-11 text-[13px] font-medium text-white/90 shadow-[0_16px_38px_rgba(7,24,74,0.55)] backdrop-blur sm:h-12 sm:text-[14px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                      Вид работ
                    </p>
                    <div className="relative">
                      <HardHat className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                      <Select value={workType} onValueChange={onWorkTypeChange}>
                        <SelectTrigger className="h-11 rounded-2xl border border-white/20 bg-white/10 pl-11 pr-12 text-[13px] font-medium text-white/90 shadow-[0_16px_38px_rgba(7,24,74,0.55)] backdrop-blur sm:h-12 sm:text-[14px]">
                          <SelectValue placeholder="Выберите вид работ" />
                        </SelectTrigger>
                        <SelectContent className="border border-white/15 bg-[#07132F]/95 text-white">
                          {workTypes.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Дата</p>
                    <div className="relative">
                      <Input
                        type="date"
                        value={date}
                        onChange={(event) => onDateChange(event.target.value)}
                        className="h-11 rounded-2xl border border-white/20 bg-white/10 pl-12 pr-12 text-[13px] font-medium text-white/90 placeholder:text-white/50 [appearance:none] sm:h-12 sm:text-[14px]"
                      />
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Объём</p>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="12,5"
                        value={volume}
                        onChange={(event) => onVolumeChange(event.target.value)}
                        className="h-11 flex-1 rounded-2xl border border-white/20 bg-white/10 text-[13px] font-medium text-white/90 placeholder:text-white/40 sm:h-12 sm:text-[14px]"
                      />
                      <div className="flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3 text-[11px] text-white/75 sm:h-12 sm:px-4 sm:text-[12px]">
                        м³
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Техника</p>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="3"
                        value={machines}
                        onChange={(event) => onMachinesChange(event.target.value)}
                        className="h-11 flex-1 rounded-2xl border border-white/20 bg-white/10 text-[13px] font-medium text-white/90 placeholder:text-white/40 sm:h-12 sm:text-[14px]"
                      />
                      <div className="flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3 text-[11px] text-white/75 sm:h-12 sm:px-4 sm:text-[12px]">
                        шт.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Люди</p>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                    <Input
                      inputMode="numeric"
                      placeholder="кол-во человек"
                      value={people}
                      onChange={(event) => onPeopleChange(event.target.value)}
                      className="h-11 rounded-2xl border border-white/20 bg-white/10 pl-11 text-[13px] font-medium text-white/90 placeholder:text-white/40 sm:h-12 sm:text-[14px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">Комментарий</p>
                  <Textarea
                    value={comment}
                    onChange={(event) => onCommentChange(event.target.value)}
                    placeholder="Кратко опишите выполненные работы…"
                    className="min-h-[80px] rounded-3xl border border-white/20 bg-white/10 text-[12px] text-white/90 placeholder:text-white/45 sm:min-h-[96px] sm:text-[13px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65 sm:text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" /> Выберите фото
                    </span>
                    <span className="text-white/55">JPG/PNG/HEIC, до 10 МБ</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onFilesSelected}
                  />

                  <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-white/30 bg-white/5 px-4 py-3 text-sm text-white/75 sm:flex-row sm:items-center">
                    <div className="flex-1 text-[11px] leading-tight sm:text-[12px]">Перетащите фото или нажмите «Выбрать»</div>
                    <Button
                      type="button"
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-4 py-1.5 text-[12px] font-semibold text-sky-900 shadow-[0_18px_50px_rgba(3,144,255,0.9)] hover:brightness-110"
                      onClick={onPickFiles}
                    >
                      <Upload className="h-3.5 w-3.5" /> Выбрать
                    </Button>
                    {hasFiles && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full border-white/30 bg-white/15 px-3 text-[11px] text-white/80 backdrop-blur hover:bg-white/25"
                        onClick={onClearFiles}
                      >
                        Очистить
                      </Button>
                    )}
                  </div>

                  {fileValidationMessage && (
                    <p className="text-[10px] font-medium text-amber-200/90 sm:text-[11px]">{fileValidationMessage}</p>
                  )}

                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-3 sm:gap-3">
                    {(previews.length ? previews : [null, null, null])
                      .slice(0, 3)
                      .map((src, index) => (
                        <div
                          key={index}
                          className="flex aspect-square items-center justify-center rounded-xl border border-white/20 bg-white/5 sm:aspect-[4/3] sm:rounded-2xl"
                        >
                          {src ? (
                            <img
                              src={src}
                              alt="Предпросмотр"
                              className="h-full w-full rounded-xl object-cover sm:rounded-2xl"
                            />
                          ) : (
                            <span className="text-[10px] text-white/45 sm:text-[11px]">Фото</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      className="h-11 rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-6 text-[12px] font-semibold text-sky-900 shadow-[0_24px_60px_rgba(3,144,255,0.85)] hover:brightness-110 disabled:opacity-70 sm:text-[13px]"
                      onClick={onSendReport}
                      disabled={sending || !isFormReady}
                    >
                      {sending ? "Отправка…" : "Отправить отчёт"}
                    </Button>
                    <div className="flex-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {requiredHintVisible && !isFormReady && (
                    <p className="text-[10px] font-medium text-amber-100/90 sm:text-[11px]">
                      Чтобы отправить отчёт, заполните: {missingFields.join(", ")}.
                    </p>
                  )}
                  {progress > 0 && <p className="text-[10px] text-white/70 sm:text-[11px]">Загрузка: {progress}%</p>}
                </div>
          </CardContent>
        </Card>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        <div className="w-full max-w-[700px] rounded-[28px] border border-white/15 bg-white/10 px-4 py-3 text-white/85 shadow-[0_-18px_50px_rgba(6,17,44,0.55)] backdrop-blur-[18px] sm:px-6">
          <div className="flex items-center justify-between gap-3 text-[12px] font-semibold sm:text-[13px]">
            <button
              type="button"
              onClick={onBack}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-white/80 transition hover:text-white"
            >
              ← На главный
            </button>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-white/80 transition hover:text-white"
            >
              📜 История
            </button>
          </div>
        </div>
      </div>
      {isHistoryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div className="absolute inset-0 bg-[#050B1F]/70 backdrop-blur-[2px]" />
          <div
            className="relative w-full max-w-[720px] rounded-t-[28px] border border-white/15 bg-[#0B1530]/95 px-4 pb-8 pt-3 text-white shadow-[0_-24px_70px_rgba(6,17,44,0.65)] backdrop-blur-[28px] sm:rounded-t-[32px] sm:px-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[14px] font-semibold sm:text-[15px]">
                <HistoryIcon className="h-4 w-4" /> История
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsHistoryOpen(false)}
                className="h-8 w-8 rounded-full text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {historyContent}
          </div>
        </div>
      )}
    </div>
  );
}
