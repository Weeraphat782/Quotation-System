"use client"

import { useApp } from "@/lib/app-context"
import { useParams, useRouter } from "next/navigation"
import CustomerPortfolio from "@/components/customer/customer-portfolio"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function CustomerPage() {
    const { id } = useParams()
    const { customers, loading } = useApp()
    const router = useRouter()

    if (loading) {
        return <div className="p-8">กำลังโหลด...</div>
    }

    const customer = customers.find((c) => c.id === id)

    if (!customer) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูลลูกค้า</h1>
                <Button onClick={() => router.back()}>กลับ</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        กลับ
                    </Button>
                    <h1 className="text-xl font-bold truncate">Customer Portfolio</h1>
                </div>
            </div>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <CustomerPortfolio customer={customer} />
            </div>
        </div>
    )
}
