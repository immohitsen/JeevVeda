import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { Header } from "@/components/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function BloodAnalyzer() {
  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Blood Report Analyzer" }]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 mb-2">Blood Report Analyzer</h1>
              <p className="text-slate-600">Upload your blood test report for AI-powered cancer detection analysis</p>
            </div>

            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Blood Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">Drop your blood report here</p>
                  <p className="text-slate-600 mb-6">Supports PDF, JPG, PNG files up to 10MB</p>
                  <Button className="bg-slate-900 hover:bg-slate-800">Choose File</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
