"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Opportunity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, MoreHorizontal, Pencil, Trash2, Eye, Edit2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import QuotationForm from "../quotation/quotation-form"
import { useRouter } from "next/navigation"
import type { Quotation } from "@/lib/types"

const stages: { id: Opportunity["stage"]; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "bg-kanban-lead" },
  { id: "qualified", label: "Qualified", color: "bg-kanban-qualified" },
  { id: "proposal", label: "Proposal", color: "bg-kanban-proposal" },
  { id: "negotiation", label: "Negotiation", color: "bg-kanban-negotiation" },
  { id: "won", label: "Won", color: "bg-kanban-won" },
  { id: "lost", label: "Lost", color: "bg-kanban-lost" },
]

export default function OpportunityBoard() {
  const router = useRouter()
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [editingOp, setEditingOp] = useState<Opportunity | null>(null)
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false)

  const {
    opportunities,
    customers,
    companies,
    quotations,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    deleteQuotation,
    moveOpportunityStage,
    currentUser,
  } = useApp()

  const handleDeleteQuotation = async (id: string) => {
    if (confirm("ต้องการลบ Quotation นี้หรือไม่?")) {
      await deleteQuotation(id)
    }
  }
  const [formData, setFormData] = useState({
    title: "",
    customer_id: "",
    company_id: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      customer_id: "",
      company_id: "",
      notes: "",
    })
    setEditingOp(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingOp) {
      await updateOpportunity(editingOp.id, formData)
    } else {
      await addOpportunity({
        ...formData,
        stage: "lead",
        created_by: currentUser?.id || "",
      })
    }
    setIsOpen(false)
    resetForm()
  }

  const handleEdit = (op: Opportunity) => {
    setEditingOp(op)
    setFormData({
      title: op.title,
      customer_id: op.customer_id,
      company_id: op.company_id,
      notes: op.notes || "",
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("ต้องการลบ Opportunity นี้หรือไม่?")) {
      await deleteOpportunity(id)
    }
  }

  const handleDragStart = (e: React.DragEvent, opId: string) => {
    e.dataTransfer.setData("text/plain", opId)
  }

  const handleDrop = async (e: React.DragEvent, stage: Opportunity["stage"]) => {
    e.preventDefault()
    const opId = e.dataTransfer.getData("text/plain")
    await moveOpportunityStage(opId, stage)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const openQuotationDialog = (op: Opportunity) => {
    setSelectedOpportunity(op)
    setQuotationDialogOpen(true)
  }

  const getOpportunityQuotations = (op: Opportunity) => {
    return quotations.filter((q) => q.opportunity_id === op.id)
  }

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Opportunity Board</h2>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              สร้าง Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOp ? "แก้ไข Opportunity" : "สร้าง Opportunity ใหม่"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อ Opportunity</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น Training Project Q1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id">บริษัท (ของเรา)</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกบริษัท" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name_th}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_id">ลูกค้า</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกลูกค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">บันทึก</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">{editingOp ? "บันทึก" : "สร้าง"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-72"
            onDrop={(e) => handleDrop(e, stage.id)}
            onDragOver={handleDragOver}
          >
            <div className={`${stage.color} rounded-t-lg px-3 py-2`}>
              <h3 className="font-medium text-sm text-foreground">
                {stage.label}
                <span className="ml-2 text-muted-foreground">
                  ({opportunities.filter((o) => o.stage === stage.id).length})
                </span>
              </h3>
            </div>
            <div className="bg-muted/50 rounded-b-lg p-2 min-h-[500px] space-y-2">
              {opportunities
                .filter((op) => op.stage === stage.id)
                .map((op) => {
                  const customer = customers.find((c) => c.id === op.customer_id)
                  const opQuotations = getOpportunityQuotations(op)

                  return (
                    <div
                      key={op.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, op.id)}
                      className="bg-card rounded-lg border p-3 cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{op.title}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openQuotationDialog(op)}>
                              <FileText className="w-4 h-4 mr-2" />
                              สร้าง Quotation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(op)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(op.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{customer?.name || "ไม่ระบุลูกค้า"}</p>
                      {op.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{op.notes}</p>}

                      {/* Quotations list */}
                      {opQuotations.length > 0 && (
                        <div className="mt-3 pt-3 border-t space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Quotations ({opQuotations.length})
                          </p>
                          {opQuotations.map((q) => (
                            <div
                              key={q.id}
                              className="flex items-center justify-between text-xs bg-muted rounded px-2 py-1"
                            >
                              <span>{q.quotation_number}</span>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${q.status === "accepted"
                                    ? "bg-kanban-won text-foreground"
                                    : q.status === "rejected"
                                      ? "bg-kanban-lost text-foreground"
                                      : q.status === "sent"
                                        ? "bg-kanban-proposal text-foreground"
                                        : "bg-muted-foreground/20"
                                    }`}
                                >
                                  {q.status}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-blue-600"
                                    onClick={() => setEditingQuotation(q)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-destructive"
                                    onClick={() => handleDeleteQuotation(q.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => router.push(`/quotation/${q.id}`)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Quotation Dialog */}
      {selectedOpportunity && (
        <Dialog open={quotationDialogOpen} onOpenChange={setQuotationDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>สร้าง Quotation - {selectedOpportunity.title}</DialogTitle>
            </DialogHeader>
            <QuotationForm opportunity={selectedOpportunity} onClose={() => setQuotationDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Quotation Dialog */}
      {editingQuotation && (
        <Dialog open={!!editingQuotation} onOpenChange={(open) => !open && setEditingQuotation(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>แก้ไข Quotation - {editingQuotation.quotation_number}</DialogTitle>
            </DialogHeader>
            <QuotationForm
              opportunity={opportunities.find(o => o.id === editingQuotation.opportunity_id)!}
              quotation={editingQuotation}
              onClose={() => setEditingQuotation(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
