"use client";

import { useEffect, useState } from "react";
import { MRIReportViewer } from "@/components/mri-report-viewer";
import { BloodReportViewer } from "@/components/blood-report-viewer";
import { CancerReportViewer } from "@/components/cancer-report-viewer";
import { MRIReportData } from "@/types/mri-report";
import { BloodReportData } from "@/types/blood-report";
import { RiskAssessment } from "@/types/cancer-report";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

interface CancerReportData {
  reportType: 'RISK_ASSESSMENT';
  collectedData?: Record<string, unknown>;
  user_health_data?: Record<string, unknown>;
  assessment?: string;
  assessment_report?: string;
  risk_assessment?: RiskAssessment;
}

type AnyReportData = MRIReportData | BloodReportData | CancerReportData | Record<string, unknown>;

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [reportData, setReportData] = useState<AnyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setUnwrappedParams);
  }, [params]);

  useEffect(() => {
    if (!unwrappedParams || userLoading) return;

    const fetchReport = async () => {
      try {
        const decodedId = decodeURIComponent(unwrappedParams.id);



        // Fetch Real Report
        const res = await fetch(`/api/reports/${decodedId}`);
        const data = await res.json();

        if (data.success && data.report) {
          // Unwrap reportData if present, otherwise assume data.report is the report
          const dbReport = data.report.reportData ? {
            ...data.report.reportData,
            _id: data.report._id,
            reportType: data.report.reportType,
            createdAt: data.report.createdAt
          } : data.report;

          // Ensure ID is passed through
          if (!dbReport.id) dbReport.id = data.report._id || decodedId;



          setReportData(dbReport);
        } else {
          setError(data.error || "Failed to load report");
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [unwrappedParams, userLoading]);

  // Loading State
  if (loading || userLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading report data...</p>
      </div>
    );
  }

  // Error State
  if (error || !reportData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-full">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Unable to load report</h2>
        <p className="text-muted-foreground">{error || "Report not found or access denied."}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Helper to calculate age from DOB
  const calculateAge = (dob: string | Date | undefined) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Construct Patient Object from User Data (for MRI legacy prop)
  const patientProps = user ? {
    id: user.id || "UNKNOWN",
    name: user.fullName || "Unknown Patient",
    age: calculateAge(user.dateOfBirth),
    sex: (user.gender as "Male" | "Female" | "Other") || "Other",
    dob: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB') : "Unknown"
  } : undefined;

  const isBloodReport = (data: AnyReportData): data is BloodReportData => {
    return data.reportType === 'BLOOD_ANALYSIS';
  }

  const isCancerReport = (data: AnyReportData): data is CancerReportData => {
    return data.reportType === 'RISK_ASSESSMENT';
  }

  return (
    <div className="h-screen w-full bg-gray-50/50 dark:bg-neutral-900/50 overflow-hidden flex flex-col">
      {/* Back button logic moved to viewers for better layout control */}

      {isBloodReport(reportData) ? (
        <div className="p-4 md:p-8 overflow-y-auto h-full">
          <div className="mb-6 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <BloodReportViewer report={reportData} />
        </div>
      ) : isCancerReport(reportData) ? (
        <div className="p-4 md:p-8 overflow-y-auto h-full">
          <div className="mb-6 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <CancerReportViewer
            data={(reportData as CancerReportData).collectedData || (reportData as CancerReportData).user_health_data || {}}
            reportText={(reportData as CancerReportData).assessment || (reportData as CancerReportData).assessment_report || ""}
            riskAssessment={(reportData as CancerReportData).risk_assessment}
          />
        </div>
      ) : (
        <MRIReportViewer
          report={reportData as MRIReportData}
          patient={patientProps}
          onBack={() => router.back()}
        />
      )}
    </div>
  );
}
