"use client"

import { useApp } from "@/lib/app-context"
import type { Customer, Opportunity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Mail, Phone, User, FileText, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface CustomerPortfolioProps {
    customer: Customer
}

export default function CustomerPortfolio({ customer }: CustomerPortfolioProps) {
    const { opportunities, quotations } = useApp()
    const router = useRouter()

    const customerOpportunities = opportunities.filter((o) => o.customer_id === customer.id)

    const getStageColor = (stage: string) => {
        switch (stage) {
            case "lead": return "bg-blue-100 text-blue-800"
            case "qualified": return "bg-cyan-100 text-cyan-800"
            case "proposal": return "bg-amber-100 text-amber-800"
            case "negotiation": return "bg-orange-100 text-orange-800"
            case "won": return "bg-green-100 text-green-800"
            case "lost": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const getQuotationsForOpportunity = (opId: string) => {
        return quotations.filter((q) => q.opportunity_id === opId)
    }

    const totalOpportunityValue = customerOpportunities.reduce((sum, op) => {
        const opQuotations = getQuotationsForOpportunity(op.id)
        const latestAccepted = opQuotations.find(q => q.status === 'accepted')
        if (latestAccepted) return sum + latestAccepted.grand_total
        const latest = opQuotations.sort((a, b) => b.quotation_number.localeCompare(a.quotation_number))[0]
        return sum + (latest?.grand_total || 0)
    }, 0)

    return (
        <div className="space-y-6">
            {/* Customer Header */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">{customer.name}</h2>
                            <p className="text-muted-foreground text-sm mt-1 max-w-md line-clamp-2">{customer.address}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
                            <p className="text-2xl font-black text-primary">
                                {totalOpportunityValue.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-sm font-normal">THB</span>
                            </p>
                        </div>
                    </div>
                </div>
                <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.contact_person || "ไม่ระบุ"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.phone || "ไม่ระบุ"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.email || "ไม่ระบุ"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>Tax ID: {customer.tax_id || "ไม่ระบุ"}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Opportunities List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center px-1">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Opportunities ({customerOpportunities.length})
                </h3>

                {customerOpportunities.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            ยังไม่มี Opportunity สำหรับลูกค้านี้
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {customerOpportunities.map((op) => {
                            const opQuotations = getQuotationsForOpportunity(op.id).sort((a, b) => b.quotation_number.localeCompare(a.quotation_number))
                            return (
                                <Card key={op.id} className="overflow-hidden border-2">
                                    {/* Opportunity Header */}
                                    <div className="bg-muted/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/opportunity/${op.id}`)}>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-lg">{op.title}</h4>
                                            <Badge className={`${getStageColor(op.stage)} border-none capitalize`}>
                                                {op.stage}
                                            </Badge>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            <ArrowRight className="w-4 h-4 mr-1" /> View Details
                                        </Button>
                                    </div>

                                    {/* Quotations Inline */}
                                    <CardContent className="p-0">
                                        {opQuotations.length === 0 ? (
                                            <div className="p-6 text-center text-muted-foreground text-sm italic">
                                                ยังไม่มี Quotation
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {opQuotations.map((q) => (
                                                    <div key={q.id} className="p-4 hover:bg-muted/5 transition-colors">
                                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold">{q.quotation_number}</span>
                                                                <Badge variant="secondary" className="text-[10px]">Rev. {q.revision}</Badge>
                                                                <Badge className={q.status === 'accepted' ? 'bg-green-100 text-green-800 border-none text-[10px]' : 'text-[10px]'}>
                                                                    {q.status.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-lg font-black text-primary">
                                                                {q.grand_total.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-muted-foreground">THB</span>
                                                            </p>
                                                        </div>

                                                        {/* Service Items */}
                                                        <div className="bg-muted/10 rounded-lg border divide-y divide-muted-foreground/10 text-sm">
                                                            <div className="bg-muted/30 px-3 py-1.5 flex justify-between text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                                                                <span>Service Items</span>
                                                                <span>Price</span>
                                                            </div>
                                                            <div className="divide-y divide-muted-foreground/5">
                                                                {q.items?.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between gap-4 px-3 py-2">
                                                                        <p className="flex-1 break-words whitespace-pre-line text-xs">{item.description}</p>
                                                                        <span className="font-mono text-xs whitespace-nowrap">{item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                                    </div>
                                                                ))}
                                                                {(!q.items || q.items.length === 0) && (
                                                                    <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">ไม่มีรายการ</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Summary */}
                                                        <div className="mt-3 flex justify-end gap-6 text-xs text-muted-foreground">
                                                            <span>Sub Total: {q.sub_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                            <span>VAT 7%: {q.vat.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
