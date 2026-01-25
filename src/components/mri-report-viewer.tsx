import { useMemo } from "react";
import { MRIReportData } from "@/types/mri-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Brain, User, Calendar, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface MRIReportViewerProps {
  report: MRIReportData;
  patient?: MRIReportData['patient'];
  onBack?: () => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function MRIReportViewer({ report: rawReport, patient, onBack }: MRIReportViewerProps) {
  // Normalize the report data to handle FastAPI response format and inject patient data
  const report = useMemo(() => {
    const data = { ...rawReport };

    // Inject patient data if provided via props
    if (patient) {
      data.patient = { ...patient, ...data.patient }; // Prefer report.patient if keys exist, or merge? Actually usually prop is source of truth if report is raw. 
      // Let's assume prop fills gaps or overrides if report is sparse.
      // If rawReport has no patient, this works.
      // If rawReport has partial patient, this works.

      // Let's do a smart merge: use prop as base, override with report data if present and not empty
      data.patient = {
        ...patient,
        ...(data.patient || {})
      };
    }

    if (!data.aiAnalysis && (data.prediction || data.confidence)) {
      const isHighRisk = data.prediction?.toLowerCase() === "cancer" || data.prediction?.toLowerCase() === "tumor";
      return {
        ...data,
        aiAnalysis: {
          riskScore: data.confidence ? Math.round(data.confidence) : 0,
          riskLevel: isHighRisk ? "High" : "Low",
          summary: `AI Analysis indicates a ${data.prediction || "Unknown"} classification with ${data.confidence?.toFixed(1)}% confidence.`,
          abnormalities: isHighRisk ? [
            {
              name: data.prediction || "Detected Anomaly",
              location: "Refer to Scan",
              confidence: (data.confidence || 0) / 100
            }
          ] : []
        }
      } as MRIReportData;
    }
    return data;
  }, [rawReport, patient]);

  // Determine classification status based on prediction




  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Header Section */}
      <div className="flex-none bg-background/95 backdrop-blur z-10 border-b p-4 md:p-8 md:pb-4 shadow-sm">
        {onBack && (
          <div className="mb-4 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-neutral-100 dark:to-neutral-400">
              MRI Analysis Report
            </h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Report ID: <span className="font-mono text-foreground">{report.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Patient & Study details */}
            <div className="space-y-6 md:col-span-1">
              {/* Patient Info Card */}
              <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-500" />
                    Patient Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                      <p className="font-medium text-base">{report.patient.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">ID</p>
                      <p className="font-medium text-sm break-all">{report.patient.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Age/Sex</p>
                      <p className="font-medium">{report.patient.age} / {report.patient.sex}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">DOB</p>
                    <p className="font-medium">{report.patient.dob}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Study Info Card */}
              <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Study Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Scan Date</p>
                      <p className="font-medium">
                        {formatDate(report.study?.scanDate || report.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Modality</p>
                      <p className="font-medium">{report.study?.modality || "MRI"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div >

            {/* Right Column: Findings and Analysis */}
            < div className="space-y-6 md:col-span-2" >

              {/* AI Analysis Summary (Highlighted) */}
              {
                report.aiAnalysis && (
                  <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-900/10 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-900/30">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                          <Brain className="w-5 h-5" />
                          AI Insights
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                              {report.aiAnalysis.riskScore}%
                            </span>
                          </div>
                          <Progress value={report.aiAnalysis.riskScore} className="h-2 bg-indigo-100 dark:bg-indigo-900/50" />



                          <p className="text-xs text-muted-foreground mt-2 text-right">
                            Based on deep learning analysis
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Analysis Summary</p>
                          <p className="text-sm leading-relaxed text-muted-foreground bg-white/40 dark:bg-white/5 p-3 rounded-md border border-indigo-50/50 dark:border-indigo-900/20">
                            {report.aiAnalysis.summary}
                          </p>
                        </div>
                      </div>

                      {report.aiAnalysis.abnormalities.length > 0 && (
                        <div className="mt-4 text-sm bg-white dark:bg-black/20 rounded-md p-3 border border-indigo-100 dark:border-indigo-900/50">
                          <p className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2 text-xs uppercase tracking-wide flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            Detected Abnormalities
                          </p>
                          <ul className="space-y-2">
                            {report.aiAnalysis.abnormalities?.map((item, idx) => (
                              <li key={idx} className="flex justify-between items-center p-2 rounded bg-indigo-50/50 dark:bg-indigo-900/20">
                                <span className="font-medium text-indigo-900 dark:text-indigo-200">{item.name} <span className="text-muted-foreground text-xs font-normal">({item.location})</span></span>
                                <Badge variant="outline" className="text-xs border-indigo-200 dark:border-indigo-800">{(item.confidence * 100).toFixed(0)}% Conf.</Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              }


              {/* Key Findings */}
              {/* <Card className="shadow-sm border-muted-foreground/10">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-500" />
                Radiological Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {(report.findings || []).length > 0 ? (report.findings || []).map((finding, index) => (
                <div key={index} className="group">
                  <h3 className="font-semibold text-base mb-1 text-foreground/90 group-hover:text-indigo-600 transition-colors">
                    {finding.sectionTitle}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {finding.content}
                  </p>
                  {index < report.findings.length - 1 && <Separator className="mt-4 opacity-50" />}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 opacity-60">
                  <div className="p-3 bg-muted rounded-full">
                    <ClipboardX className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No specific radiological findings were recorded for this report.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impression */}
              {/* <Card className="shadow-sm border-muted-foreground/10 bg-slate-50/50 dark:bg-slate-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Impression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(report.impression || []).length > 0 ? (report.impression || []).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-foreground/90">{imp}</span>
                  </li>
                )) : (
                  <div className="flex items-center gap-3 py-4 text-muted-foreground opacity-70">
                    <Info className="w-5 h-5" />
                    <p className="text-sm italic">No specific clinical impressions available.</p>
                  </div>
                )}
              </ul>
            </CardContent>
          </Card> */}

              {/* Images Gallery */}
              {
                report.images && report.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(report.images || []).map((img, idx) => (
                      <div key={idx} className="group relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm bg-muted/20">
                        <Image
                          src={img.url}
                          alt={img.caption}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-white text-xs font-medium">{img.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
