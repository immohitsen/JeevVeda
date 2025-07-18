"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface HeaderProps {
  title?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function Header({ title = "Dashboard", breadcrumbs }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm px-4">
      <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {breadcrumbs ? (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href} className="text-slate-600 hover:text-slate-900">
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-slate-900 font-medium">{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-8 bg-slate-50/80 border-slate-200 focus:bg-white"
          />
        </div>
        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
