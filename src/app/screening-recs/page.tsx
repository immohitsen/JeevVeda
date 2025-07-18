import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function ScreeningRecommendations() {
  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Screening Recommendations" }]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-purple-50/30 min-h-screen">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 mb-2">Screening Recommendations</h1>
              <p className="text-slate-600">Personalized cancer screening suggestions based on your profile</p>
            </div>

            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recommended Screenings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-slate-600 py-12">
                  Screening recommendations interface would be implemented here
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
