"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Opportunity, Quotation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Eye, Trash2, Plus, FileText, Building2, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QuotationForm from "@/components/quotation/quotation-form"

interface OpportunityDetailsProps {
    opportunity: Opportunity
}

export default function OpportunityDetails({ opportunity }: OpportunityDetailsProps) {
    const { customers, companies, quotations, deleteQuotation } = useApp()
    const router = useRouter()
    const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)
    const [quotationDialogOpen, setQuotationDialogOpen] = useState(false)

    const customer = customers.find((c) => c.id === opportunity.customer_id)
    const company = companies.find((c) => c.id === opportunity.company_id)
    const opQuotations = quotations.filter((q) => q.opportunity_id === opportunity.id)

    const handleDeleteQuotation = async (id: string) => {
        if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Quotation นี้?")) {
            await deleteQuotation(id)
        }
    }

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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                            <Badge className={`mt-2 ${getStageColor(opportunity.stage)} border-none capitalize`}>
                                {opportunity.stage}
                            </Badge>
                        </div>
                        <Button onClick={() => setQuotationDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            สร้าง Quotation
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Description / Notes</h4>
                            <p className="whitespace-pre-line text-sm bg-muted/50 p-3 rounded-md min-h-[100px]">
                                {opportunity.notes || "ไม่มีข้อมูลบันทึก"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer & Company Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center">
                                <User className="w-4 h-4 mr-2 text-primary" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-bold">{customer?.name || "ไม่ระบุ"}</p>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line line-clamp-2">
                                {customer?.address}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center">
                                <Building2 className="w-4 h-4 mr-2 text-primary" />
                                Under Company
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-bold">{company?.name_th || "ไม่ระบุ"}</p>
                            <p className="text-xs text-muted-foreground italic mt-1">{company?.name_en}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quotations List - Refined Card Layout */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center px-1">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Quotations ({opQuotations.length})
                </h3>

                {opQuotations.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            ยังไม่มี Quotation สำหรับโปรเจกต์นี้
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {opQuotations
                            .sort((a, b) => b.quotation_number.localeCompare(a.quotation_number))
                            .map((q) => (
                                <Card key={q.id} className="overflow-hidden border-2 hover:border-primary/20 transition-colors">
                                    <div className="bg-muted/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-lg">{q.quotation_number}</span>
                                            <Badge variant="secondary">Rev. {q.revision}</Badge>
                                            <Badge className={q.status === 'accepted' ? 'bg-green-100 text-green-800 border-none' : ''}>
                                                {q.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Grand Total</p>
                                            <p className="text-xl font-black text-primary">
                                                {q.grand_total.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-muted-foreground uppercase ml-1">THB</span>
                                            </p>
                                        </div>
                                    </div>

                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Left: Summary and Items List */}
                                            <div className="lg:col-span-2 space-y-4">
                                                <div className="bg-muted/10 rounded-lg border divide-y divide-muted-foreground/10">
                                                    <div className="bg-muted/30 px-4 py-2 flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                                        <span>Service Items</span>
                                                        <span>Price</span>
                                                    </div>
                                                    <div className="divide-y divide-muted-foreground/5">
                                                        {q.items?.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between gap-4 px-4 py-3 hover:bg-muted/5 transition-colors">
                                                                <p className="font-medium text-sm leading-relaxed flex-1 break-words whitespace-pre-line">
                                                                    {item.description}
                                                                </p>
                                                                <span className="font-mono text-sm whitespace-nowrap pt-0.5">
                                                                    {item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {(!q.items || q.items.length === 0) && (
                                                            <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
                                                                ไม่มีรายการบริการ
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {q.remarks && (
                                                    <div className="px-1">
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 italic">Remark:</p>
                                                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{q.remarks}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Breakdown & Actions */}
                                            <div className="space-y-6 flex flex-col justify-between">
                                                <div className="space-y-2 border-t pt-4 lg:border-t-0 lg:pt-0">
                                                    <div className="flex justify-between text-sm text-muted-foreground">
                                                        <span>Sub Total:</span>
                                                        <span>{q.sub_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-muted-foreground">
                                                        <span>VAT 7%:</span>
                                                        <span>{q.vat.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed">
                                                        <span>Total Amount:</span>
                                                        <span>{q.grand_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 pt-4">
                                                    <Button
                                                        className="flex-1 min-w-[120px]"
                                                        onClick={() => router.push(`/quotation/${q.id}`)}
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Preview PDF
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 min-w-[80px]"
                                                        onClick={() => setEditingQuotation(q)}
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/5"
                                                        onClick={() => handleDeleteQuotation(q.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={quotationDialogOpen} onOpenChange={setQuotationDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>สร้าง Quotation - {opportunity.title}</DialogTitle>
                    </DialogHeader>
                    <QuotationForm opportunity={opportunity} onClose={() => setQuotationDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            {editingQuotation && (
                <Dialog open={!!editingQuotation} onOpenChange={(open) => !open && setEditingQuotation(null)}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>แก้ไข Quotation - {editingQuotation.quotation_number}</DialogTitle>
                        </DialogHeader>
                        <QuotationForm
                            opportunity={opportunity}
                            quotation={editingQuotation}
                            onClose={() => setEditingQuotation(null)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
