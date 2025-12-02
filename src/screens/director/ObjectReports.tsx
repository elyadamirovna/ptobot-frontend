import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRu, toOneLine } from "@/lib/format";
import { ObjectReport } from "@/screens/contractor/ObjectReports";

interface DirectorObjectReportsProps {
  objectName: string;
  reports: ObjectReport[];
  onBack: () => void;
}

export function DirectorObjectReports({ objectName, reports, onBack }: DirectorObjectReportsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="h-9 rounded-full border-white/40 bg-white/20 px-3 text-[12px] text-white/90 backdrop-blur hover:bg-white/30"
          onClick={onBack}
        >
          Назад
        </Button>
        <h2 className="text-lg font-semibold text-white sm:text-xl">{objectName}</h2>
      </div>

      <Card className="glass-panel border-white/25 bg-gradient-to-br from-white/14 via-white/10 to-white/5 text-white shadow-[0_24px_70px_rgba(6,17,44,0.52)] backdrop-blur-[30px]">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-[18px] font-semibold tracking-wide text-white sm:text-[20px]">Отчёты по объекту</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/95 text-slate-900 shadow-[0_18px_48px_rgba(8,47,73,0.25)]"
            >
              <CardContent className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] sm:text-[14px]">
                  <span className="font-semibold text-slate-900">{formatRu(report.date)}</span>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-semibold text-indigo-800">
                    {report.workType}
                  </span>
                </div>

                <div className="text-[13px] text-slate-700 sm:text-[14px]">
                  {report.summary
                    ? report.summary
                    : toOneLine(
                        [
                          report.volume ? `Объём: ${report.volume}` : "",
                          report.machines ? `Техника: ${report.machines}` : "",
                          report.people ? `Люди: ${report.people}` : "",
                        ]
                          .filter(Boolean)
                          .join("\n")
                      )}
                </div>

                {report.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {report.photos.slice(0, 3).map((photo, index) => (
                      <div
                        key={photo}
                        className="overflow-hidden rounded-xl border border-white/20 bg-white/60 shadow-[0_12px_32px_rgba(8,47,73,0.18)] sm:rounded-2xl"
                      >
                        <img src={photo} alt={`Фото ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
