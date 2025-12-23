import React, { RefObject } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { HardHat, Image as ImageIcon, Upload } from "lucide-react";
import { WorkType } from "@/types/app";
import { formatRu } from "@/utils/format";
import { Stepper } from "@/components/ui/stepper";

interface ReportFormScreenProps {
  objectName: string;
  date: string;
  workTypes: WorkType[];
  workType: string | undefined;
  volume: string;
  machines: number;
  people: number;
  comment: string;
  previews: string[];
  fileValidationMessage: string | null;
  isSubmitting: boolean;
  isFormReady: boolean;
  requiredHintVisible: boolean;
  missingFields: string[];
  submitSuccess: boolean;
  submitError: string | null;
  onWorkTypeChange: (value: string) => void;
  onVolumeChange: (value: string) => void;
  onMachinesChange: (value: number) => void;
  onPeopleChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  onPickFiles: () => void;
  onClearFiles: () => void;
  onSendReport: () => void;
  onFilesSelected: React.ChangeEventHandler<HTMLInputElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  hasFiles: boolean;
}

export function ReportFormScreen({
  objectName,
  date,
  workTypes,
  workType,
  volume,
  machines,
  people,
  comment,
  previews,
  fileValidationMessage,
  isSubmitting,
  isFormReady,
  requiredHintVisible,
  missingFields,
  submitSuccess,
  submitError,
  onWorkTypeChange,
  onVolumeChange,
  onMachinesChange,
  onPeopleChange,
  onCommentChange,
  onPickFiles,
  onClearFiles,
  onSendReport,
  onFilesSelected,
  fileInputRef,
  hasFiles,
}: ReportFormScreenProps) {
  return (
    <div className="relative rounded-[32px] px-4 pb-8 pt-6 sm:rounded-[44px] sm:px-6 sm:pb-9 sm:pt-7 lg:rounded-[52px] lg:px-8 lg:pb-10 lg:pt-8">
      <div className="glass-grid-overlay" />
      <div className="relative">
        <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_28px_80px_rgba(6,17,44,0.55)] backdrop-blur-[32px]">
          <CardHeader className="pb-5 sm:pb-6">
            <CardTitle className="text-[18px] font-semibold tracking-wide text-white sm:text-[20px]">
              Ежедневный отчёт
            </CardTitle>
            <p className="text-xs text-white/80">{formatRu(date)}</p>
            <p className="text-[13px] font-semibold text-white/85">{objectName}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-[12px] sm:p-7 sm:pt-1 sm:text-[13px]">
            <div className="grid gap-3 rounded-3xl border border-white/20 bg-white/5 p-4 backdrop-blur-xl">
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                  Вид работ
                </p>
                <div className="relative">
                  <HardHat className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
                  <Select value={workType} onValueChange={onWorkTypeChange} disabled={isSubmitting}>
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                  Объём
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="12,5"
                    value={volume}
                    onChange={(event) => onVolumeChange(event.target.value)}
                    disabled={isSubmitting}
                    className="h-11 flex-1 rounded-2xl border border-white/20 bg-white/10 text-[13px] font-medium text-white/90 placeholder:text-white/40 sm:h-12 sm:text-[14px]"
                  />
                  <div className="flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3 text-[11px] text-white/75 sm:h-12 sm:px-4 sm:text-[12px]">
                    м³
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Stepper
                label="Люди"
                value={people}
                disabled={isSubmitting}
                onChange={onPeopleChange}
              />
              <Stepper
                label="Техника"
                value={machines}
                disabled={isSubmitting}
                onChange={onMachinesChange}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                Комментарий
              </p>
              <Textarea
                value={comment}
                onChange={(event) => onCommentChange(event.target.value)}
                placeholder="Кратко опишите выполненные работы…"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />

              <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-white/30 bg-white/5 px-4 py-3 text-sm text-white/75 sm:flex-row sm:items-center">
                <div className="flex-1 text-[11px] leading-tight sm:text-[12px]">
                  Перетащите фото или нажмите «Выбрать»
                </div>
                <Button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5FE0FF] via-[#7DF0FF] to-[#B5F5FF] px-4 py-1.5 text-[12px] font-semibold text-sky-900 shadow-[0_18px_50px_rgba(3,144,255,0.9)] hover:brightness-110"
                  onClick={onPickFiles}
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  >
                    Очистить
                  </Button>
                )}
              </div>

              {fileValidationMessage && (
                <p className="text-[10px] font-medium text-amber-200/90 sm:text-[11px]">
                  {fileValidationMessage}
                </p>
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
                        <span className="text-[10px] text-white/45 sm:text-[11px]">
                          Фото
                        </span>
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
                  disabled={isSubmitting || !isFormReady}
                >
                  {isSubmitting ? "Отправляем…" : "Отправить отчёт"}
                </Button>
              </div>
              {requiredHintVisible && !isFormReady && (
                <p className="text-[10px] font-medium text-amber-100/90 sm:text-[11px]">
                  Чтобы отправить отчёт, заполните: {missingFields.join(", ")}.
                </p>
              )}
              {submitSuccess && (
                <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/15 p-3 text-[12px] text-emerald-100">
                  ✅ Отчёт отправлен
                </div>
              )}
              {submitError && (
                <div className="rounded-2xl border border-rose-300/40 bg-rose-500/15 p-3 text-[12px] text-rose-100">
                  ❌ {submitError}
                  <button
                    type="button"
                    onClick={onSendReport}
                    className="ml-3 rounded-full border border-rose-200/40 px-3 py-1 text-[11px] text-rose-100"
                    disabled={isSubmitting}
                  >
                    Повторить
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
