"use client"

import { useApp } from "@/lib/app-context"
import { useParams, useRouter } from "next/navigation"
import OpportunityDetails from "@/components/opportunity/opportunity-details"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function OpportunityPage() {
    const { id } = useParams()
    const { opportunities, loading } = useApp()
    const router = useRouter()

    if (loading) {
        return <div className="p-8">กำลังโหลด...</div>
    }

    const opportunity = opportunities.find((o) => o.id === id)

    if (!opportunity) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูล Opportunity</h1>
                <Button onClick={() => router.push("/")}>กลับไปหน้าบอร์ด</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        กลับไปหน้าบอร์ด
                    </Button>
                    <h1 className="text-xl font-bold truncate">Opportunity Details</h1>
                </div>
            </div>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <OpportunityDetails opportunity={opportunity} />
            </div>
        </div>
    )
}
