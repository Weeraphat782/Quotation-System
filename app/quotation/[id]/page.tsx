"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useApp } from "@/lib/app-context"
import QuotationPreview from "@/components/quotation/quotation-preview"
import type { Quotation } from "@/lib/types"
import { supabase } from "@/lib/supabase"

export default function QuotationPage() {
    const { id } = useParams()
    const { fetchData } = useApp()
    const [quotation, setQuotation] = useState<Quotation | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadQuotation() {
            if (!id) return

            try {
                // Fetch the specific quotation with items
                const { data: qData, error: qError } = await supabase
                    .from("quotations")
                    .select("*, items:quotation_items(*)")
                    .eq("id", id)
                    .single()

                if (qError) {
                    console.error("Supabase Error:", qError)
                    throw qError
                }

                setQuotation(qData)

                // Ensure master data is loaded in context
                await fetchData()
            } catch (error) {
                console.error("Error loading quotation:", error)
            } finally {
                setLoading(false)
            }
        }

        loadQuotation()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium animate-pulse text-muted-foreground">กำลังโหลดข้อมูลเอกสาร...</p>
                </div>
            </div>
        )
    }

    if (!quotation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">ไม่พบข้อมูล Quotation</h1>
                    <p className="text-muted-foreground">เอกสารนี้อาจไม่มีอยู่จริงหรือถูกลบไปแล้ว</p>
                </div>
            </div>
        )
    }

    return <QuotationPreview quotation={quotation} />
}
