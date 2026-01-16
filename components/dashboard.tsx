"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Building2, UserCircle, FileText, Kanban, LogOut, Menu, X } from "lucide-react"
import EmployeeMaster from "./masters/employee-master"
import CompanyMaster from "./masters/company-master"
import CustomerMaster from "./masters/customer-master"
import OpportunityBoard from "./opportunity/opportunity-board"
import QuotationList from "./quotation/quotation-list"

type View = "dashboard" | "employees" | "companies" | "customers" | "opportunities" | "quotations"

const navItems = [
  { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "opportunities" as View, label: "Opportunities", icon: Kanban },
  { id: "quotations" as View, label: "Quotations", icon: FileText },
  { id: "employees" as View, label: "พนักงาน", icon: Users },
  { id: "companies" as View, label: "บริษัท", icon: Building2 },
  { id: "customers" as View, label: "ลูกค้า", icon: UserCircle },
]

export default function Dashboard() {
  const { currentUser, logout, opportunities, quotations, companies, customers } = useApp()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (currentView) {
      case "employees":
        return <EmployeeMaster />
      case "companies":
        return <CompanyMaster />
      case "customers":
        return <CustomerMaster />
      case "opportunities":
        return <OpportunityBoard />
      case "quotations":
        return <QuotationList />
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard title="Opportunities" value={opportunities.length} icon={Kanban} color="bg-chart-1" />
              <DashboardCard title="Quotations" value={quotations.length} icon={FileText} color="bg-chart-2" />
              <DashboardCard title="บริษัท" value={companies.length} icon={Building2} color="bg-chart-3" />
              <DashboardCard title="ลูกค้า" value={customers.length} icon={UserCircle} color="bg-chart-4" />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setCurrentView("opportunities")}
                  >
                    <Kanban className="w-4 h-4 mr-2" />
                    สร้าง Opportunity ใหม่
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setCurrentView("customers")}
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    เพิ่มลูกค้าใหม่
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setCurrentView("companies")}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    จัดการข้อมูลบริษัท
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Pipeline Summary</h3>
                <div className="space-y-3">
                  {["lead", "qualified", "proposal", "negotiation", "won", "lost"].map((stage) => {
                    const count = opportunities.filter((o) => o.stage === stage).length
                    return (
                      <div key={stage} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{stage}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-sidebar border-r transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">QMS</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${currentView === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{currentUser?.full_name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 p-4 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{navItems.find((item) => item.id === currentView)?.label}</h1>
        </header>

        <div className="h-full overflow-auto">{renderContent()}</div>
      </main>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </div>
  )
}
