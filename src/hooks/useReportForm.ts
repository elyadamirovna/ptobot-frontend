import { useCallback, useMemo, useRef, useState } from "react";
import type { WorkType } from "@/types/app";

const FILE_SIZE_LIMIT_MB = 8;
const ACCEPTED_MIME_PREFIX = "image/";

export interface ReportFormOptions {
  apiUrl: string;
  initialProject?: string;
  initialWorkType?: string;
  initialDate?: string;
}

export function useReportForm({
  apiUrl,
  initialProject,
  initialWorkType,
  initialDate = new Date().toISOString().slice(0, 10),
}: ReportFormOptions) {
  const [project, setProject] = useState<string | undefined>(initialProject);
  const [workType, setWorkType] = useState<string | undefined>(initialWorkType);
  const [date, setDate] = useState(initialDate);
  const [volume, setVolume] = useState("");
  const [machines, setMachines] = useState("");
  const [people, setPeople] = useState("");
  const [comment, setComment] = useState("");
  const [requiredHintVisible, setRequiredHintVisible] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileValidationMessage, setFileValidationMessage] = useState<string | null>(
    null
  );
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formCompletion = useMemo(() => {
    const total = 4;
    const filled = [project, workType, date, files.length ? "files" : null].filter(
      Boolean
    ).length;
    return Math.max(8, Math.round((filled / total) * 100));
  }, [date, files.length, project, workType]);

  const isFormReady = useMemo(
    () => Boolean(project && workType && date && files.length > 0),
    [project, workType, date, files.length]
  );

  const missingFields = useMemo(() => {
    const fields: string[] = [];
    if (!project) fields.push("объект");
    if (!workType) fields.push("вид работ");
    if (!date) fields.push("дату");
    if (!files.length) fields.push("фото");
    return fields;
  }, [project, workType, date, files.length]);

  const onPickFiles = useCallback(() => fileInputRef.current?.click(), []);

  const validateFiles = useCallback((selected: File[]) => {
    if (!selected.length) {
      return "Добавьте хотя бы одно фото для отчёта";
    }

    const oversize = selected.find(
      (file) => file.size / (1024 * 1024) > FILE_SIZE_LIMIT_MB
    );
    if (oversize) {
      return `Файл «${oversize.name}» больше ${FILE_SIZE_LIMIT_MB} МБ`;
    }

    const invalidType = selected.find(
      (file) => !file.type || !file.type.startsWith(ACCEPTED_MIME_PREFIX)
    );
    if (invalidType) {
      return "Загрузите изображения формата JPG, PNG или HEIC";
    }

    return null;
  }, []);

  const onFilesSelected = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files || []);
      const error = validateFiles(selected);

      if (error) {
        setFileValidationMessage(error);
        setFiles([]);
        setPreviews([]);
        return;
      }

      setFileValidationMessage(null);
      setFiles(selected);

      Promise.all(
        selected.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.readAsDataURL(file);
            })
        )
      ).then(setPreviews);
    },
    [validateFiles]
  );

  const handleClearFiles = useCallback(() => {
    setFiles([]);
    setPreviews([]);
    setFileValidationMessage("Добавьте хотя бы одно фото для отчёта");
  }, []);

  const validateRequiredFields = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!project) errors.project = "Выберите объект";
    if (!workType) errors.workType = "Укажите вид работ";
    if (!date) errors.date = "Выберите дату";
    if (!files.length) errors.files = "Добавьте фото для отчёта";
    setFieldErrors(errors);
    return errors;
  }, [date, files.length, project, workType]);

  const sendReport = useCallback(async () => {
    setRequiredHintVisible(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    const errors = validateRequiredFields();
    if (Object.keys(errors).length > 0) return;

    const descParts = [comment];
    if (volume) descParts.push(`Объём: ${volume}`);
    if (machines) descParts.push(`Техника: ${machines}`);
    if (people) descParts.push(`Люди: ${people}`);
    const description = descParts.filter(Boolean).join("\n");

    const form = new FormData();
    form.append("user_id", "1");
    form.append("project_id", String(project ?? ""));
    form.append("work_type_id", String(workType));
    form.append("date", date);
    form.append("description", description);
    form.append("people", people);
    form.append("volume", volume);
    form.append("machines", machines);
    files.forEach((file) => form.append("photos", file));

    try {
      setSending(true);
      setProgress(25);
      const res = await fetch(`${apiUrl}/reports`, {
        method: "POST",
        body: form,
        mode: "cors",
        credentials: "omit",
      });
      setProgress(80);
      if (!res.ok) throw new Error("Ошибка при отправке отчёта");
      const data = await res.json();
      setProgress(100);
      setVolume("");
      setMachines("");
      setPeople("");
      setComment("");
      setFiles([]);
      setPreviews([]);
      setRequiredHintVisible(false);
      setFieldErrors({});
      setSubmitSuccess("Отчёт отправлен — скоро появится в истории");
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при отправке отчёта";
      setSubmitError(message);
      throw error;
    } finally {
      setSending(false);
      setTimeout(() => setProgress(0), 600);
    }
  }, [
    apiUrl,
    comment,
    date,
    files,
    machines,
    people,
    project,
    volume,
    workType,
    validateRequiredFields,
  ]);

  const syncWorkTypes = useCallback(
    (workTypes: WorkType[]) => {
      if (!workTypes.length) return;
      setWorkType((prev) => prev ?? workTypes[0]?.id);
    },
    []
  );

  return {
    // values
    project,
    workType,
    date,
    volume,
    machines,
    people,
    comment,
    files,
    previews,
    fileValidationMessage,
    sending,
    progress,
    requiredHintVisible,
    formCompletion,
    isFormReady,
    missingFields,
    fileInputRef,
    fieldErrors,
    submitError,
    submitSuccess,

    // actions
    setProject,
    setWorkType,
    setDate,
    setVolume,
    setMachines,
    setPeople,
    setComment,
    onPickFiles,
    onFilesSelected,
    handleClearFiles,
    sendReport,
    syncWorkTypes,
    setRequiredHintVisible,
    setSubmitSuccess,
  };
}
