
import { UserHealthData } from "@/lib/types";
import { RiskAssessment } from "@/types/cancer-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    FileText,
    Activity,
    User,
    AlertTriangle,
    Stethoscope,
    CheckCircle2,
    Lightbulb
} from "lucide-react";

interface CancerReportViewerProps {
    data: Partial<UserHealthData>;
    reportText?: string;
    riskAssessment?: RiskAssessment | null;
}

export function CancerReportViewer({ data, reportText, riskAssessment }: CancerReportViewerProps) {
    const getRiskColor = (category: string = "Low") => {
        if (category.includes("High")) return "bg-red-500/10 text-red-600 border-red-200";
        if (category.includes("Moderate")) return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    };

    const getScoreColor = (score: number) => {
        if (score > 6) return "text-red-600";
        if (score > 3) return "text-yellow-600";
        return "text-emerald-600";
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-1">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-400 dark:to-teal-200">
                        Health Assessment Report
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Generated on: <span className="font-mono text-foreground">{new Date().toLocaleDateString()}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {riskAssessment && (
                        <Badge variant="outline" className={`px-4 py-1.5 text-sm font-medium border ${getRiskColor(riskAssessment.riskCategory)}`}>
                            {riskAssessment.riskCategory} Risk
                        </Badge>
                    )}
                    {/* <Badge variant="outline" className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border-blue-200">
                        AI Enhanced
                    </Badge> */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Patient Details (4 cols) */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="shadow-sm border-emerald-100 overflow-hidden">
                        <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-emerald-900">
                                <User className="w-5 h-5 text-emerald-600" />
                                Patient Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-5">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Age</p>
                                        <p className="font-medium text-gray-900">{data.age || "N/A"} years</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Gender</p>
                                        <p className="font-medium text-gray-900 capitalize">{data.gender || "N/A"}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Height / Weight</p>
                                    <p className="font-medium text-gray-900">{data.height_weight || "N/A"}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Lifestyle</p>
                                    <div className="mt-2 text-sm space-y-1 text-gray-700">
                                        <div className="flex justify-between"><span>Smoking:</span> <span className="font-medium">{data.smoking_status || "Unknown"}</span></div>
                                        <div className="flex justify-between"><span>Alcohol:</span> <span className="font-medium">{data.alcohol_consumption || "Unknown"}</span></div>
                                        <div className="flex justify-between"><span>Diet:</span> <span className="font-medium">{data.diet_habits || "Unknown"}</span></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Factors Summary (Local) */}
                    {riskAssessment && (
                        <Card className="shadow-sm border-amber-100 bg-amber-50/30">
                            <CardHeader className="pb-3 border-b border-amber-100/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    Risk Indicators
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {riskAssessment.keyRiskFactors.length > 0 ? (
                                    <ul className="space-y-2">
                                        {riskAssessment.keyRiskFactors.map((factor, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-sm text-amber-900/80">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                                {factor}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No significant risk factors identified.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Analysis (8 cols) */}
                <div className="md:col-span-8 space-y-6">

                    {/* Risk Score Banner */}
                    {riskAssessment && (
                        <Card className="border-none shadow-md bg-white overflow-hidden relative">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${getRiskColor(riskAssessment.riskCategory).split(' ')[0].replace('/10', '')}`} />
                            <CardContent className="p-6 flex items-center justify-between gap-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Calculated Risk Score</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className={`text-4xl font-bold ${getScoreColor(riskAssessment.riskScore)}`}>
                                            {riskAssessment.riskScore}
                                        </span>
                                        <span className="text-muted-foreground font-medium">/ 10</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 max-w-md">
                                        {riskAssessment.interpretation}
                                    </p>
                                </div>
                                <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border-2 border-dashed border-gray-200">
                                    <Activity className={`w-8 h-8 ${getScoreColor(riskAssessment.riskScore)}`} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Personalized Recommendations (Highlighted Box) */}
                    {riskAssessment && riskAssessment.recommendations.length > 0 && (
                        <Card className="shadow-md border-emerald-200 bg-emerald-50/40 overflow-hidden">
                            <CardHeader className="bg-emerald-100/40 border-b border-emerald-100 pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                                    Personalized Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <ul className="space-y-3">
                                    {riskAssessment.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium text-gray-800 leading-relaxed">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* AI Detailed Report */}
                    {reportText && (
                        <Card className="shadow-md border-indigo-100 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50 pb-4">
                                <CardTitle className="text-xl flex items-center gap-2 text-indigo-900">
                                    <Stethoscope className="w-6 h-6 text-indigo-600" />
                                    Clinical Assessment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 sm:p-8">
                                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {/* Render text with smart formatting */}
                                    {/* Render text with smart formatting */}
                                    {reportText.split('\n').map((line, i) => {
                                        // Helper to render text with bold support
                                        const renderFormattedText = (text: string) => {
                                            const parts = text.split(/(\*\*.*?\*\*)/);
                                            return parts.map((part, j) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={j} className="text-gray-900">{part.slice(2, -2)}</strong>;
                                                }
                                                return part;
                                            });
                                        };

                                        // Simple markdown-like rendering for standard Markdown headers/bullets
                                        if (line.startsWith('## ') || line.startsWith('### ') || line.startsWith('**Title:')) {
                                            return <h3 key={i} className="text-lg font-bold text-indigo-950 mt-6 mb-3 first:mt-0">{line.replace(/^[#*]+\s*/, '').replace(/\*+/g, '')}</h3>;
                                        }
                                        if (line.startsWith('- ') || line.startsWith('* ')) {
                                            return (
                                                <div key={i} className="flex items-start gap-2 mb-2 ml-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                                    <span className="text-gray-700">{renderFormattedText(line.replace(/^[-*]\s*/, ''))}</span>
                                                </div>
                                            );
                                        }
                                        if (line.trim() === '') return <br key={i} />;

                                        return (
                                            <p key={i} className="mb-2 text-gray-700">
                                                {renderFormattedText(line)}
                                            </p>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
