"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Quotation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, FileText, ChevronLeft, Edit2, Trash2 } from "lucide-react"
import QuotationPreview from "./quotation-preview"
import { useRouter } from "next/navigation"
import QuotationForm from "./quotation-form"

export default function QuotationList() {
  const router = useRouter()
  const { quotations, customers, companies, updateQuotation, deleteQuotation, opportunities } = useApp()
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleStatusChange = (id: string, status: Quotation["status"]) => {
    updateQuotation(id, { status })
  }

  const handleDelete = async (id: string) => {
    if (confirm("ต้องการลบ Quotation นี้หรือไม่?")) {
      await deleteQuotation(id)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">รายการ Quotation</h2>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>บริษัท</TableHead>
              <TableHead className="text-right">ยอดรวม</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="w-10 h-10 opacity-50" />
                    <p>ยังไม่มี Quotation</p>
                    <p className="text-sm">สร้าง Quotation ได้จาก Opportunity Board</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              quotations.map((quotation) => {
                const customer = customers.find((c) => c.id === quotation.customer_id)
                const company = companies.find((c) => c.id === quotation.company_id)

                return (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-mono font-medium">{quotation.quotation_number}</TableCell>
                    <TableCell>{formatDate(quotation.created_at)}</TableCell>
                    <TableCell>{customer?.name || "-"}</TableCell>
                    <TableCell>{company?.name_th || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {quotation.grand_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={quotation.status}
                        onValueChange={(value: Quotation["status"]) => handleStatusChange(quotation.id, value)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600"
                          onClick={() => {
                            const op = opportunities.find(o => o.id === quotation.opportunity_id)
                            if (op) setEditingQuotation(quotation)
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(quotation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/quotation/${quotation.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingQuotation} onOpenChange={(open) => !open && setEditingQuotation(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {editingQuotation && (
            <>
              <DialogHeader>
                <DialogTitle>แก้ไข Quotation - {editingQuotation.quotation_number}</DialogTitle>
              </DialogHeader>
              <QuotationForm
                opportunity={opportunities.find(o => o.id === editingQuotation.opportunity_id)!}
                quotation={editingQuotation}
                onClose={() => setEditingQuotation(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
