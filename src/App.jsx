import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/use-theme"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import dashboardData from "@/app/dashboard/data.json"

export default function Page() {
  const { mode, effective, setTheme } = useTheme()
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Documents
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Separator orientation="vertical" className="ml-2 mr-2 data-[orientation=vertical]:h-4" />
            <div className="flex items-center gap-2">
              <button
                className={`h-7 rounded-md px-2 text-xs font-medium border ${mode === 'light' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-transparent'}`}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                className={`h-7 rounded-md px-2 text-xs font-medium border ${mode === 'dark' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-transparent'}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
              <button
                className={`h-7 rounded-md px-2 text-xs font-medium border ${mode === 'system' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-transparent'}`}
                onClick={() => setTheme('system')}
              >
                System
              </button>
              <span className="text-xs text-muted-foreground">Effective: {effective}</span>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Stats Cards Section */}
          <ErrorBoundary>
            <SectionCards />
          </ErrorBoundary>
          
          {/* Chart Section */}
          <ErrorBoundary>
            <ChartAreaInteractive />
          </ErrorBoundary>
          
          {/* Data Table Section */}
          <ErrorBoundary>
            <DataTable data={dashboardData} />
          </ErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
