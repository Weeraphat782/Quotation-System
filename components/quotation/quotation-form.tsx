"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Opportunity, QuotationItem, Quotation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

interface QuotationFormProps {
  opportunity: Opportunity
  quotation?: Quotation // Added for edit mode
  onClose: () => void
}

export default function QuotationForm({ opportunity, quotation, onClose }: QuotationFormProps) {
  const { addQuotation, updateQuotation, currentUser, quotations } = useApp()

  // Use existing revision if editing, otherwise calculate new one
  const existingQuotations = quotations.filter((q) => q.opportunity_id === opportunity.id)
  const revision = quotation ? quotation.revision : existingQuotations.length + 1

  // Initialize items from quotation if editing, otherwise start with one empty item
  const [items, setItems] = useState<QuotationItem[]>(
    quotation?.items?.map(item => ({ ...item })) ||
    [{ id: "1", description: "", price: 0 }]
  )
  const [remarks, setRemarks] = useState(quotation?.remarks || "")
  const [includeVat, setIncludeVat] = useState(quotation ? quotation.include_vat : true)
  const [quotationDate, setQuotationDate] = useState<string>(
    quotation?.quotation_date 
      ? new Date(quotation.quotation_date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  )

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", price: 0, page: 1, hide_price: false }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: "description" | "price" | "page" | "hide_price", value: string | number | boolean) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const sub_total = items.reduce((sum, item) => sum + (item.price || 0), 0)
  const vat = includeVat ? sub_total * 0.07 : 0
  const grand_total = sub_total + vat

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const filteredItems = items.filter((item) => item.description.trim() !== "")

    if (quotation) {
      // Edit mode
      await updateQuotation(quotation.id, {
        items: filteredItems,
        sub_total,
        vat,
        grand_total,
        include_vat: includeVat,
        remarks,
        quotation_date: quotationDate,
      })
    } else {
      // Create mode
      await addQuotation({
        company_id: opportunity.company_id,
        customer_id: opportunity.customer_id,
        opportunity_id: opportunity.id,
        items: filteredItems,
        sub_total,
        vat,
        grand_total,
        include_vat: includeVat,
        remarks,
        quotation_date: quotationDate,
        revision,
        status: "draft",
        created_by: currentUser?.id || "",
      })
    }

    onClose()
  }

  // Check if any item uses page 2
  const hasPage2 = items.some(item => (item.page || 1) === 2)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Revision</Label>
          <p className="font-medium">Rev. {revision}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">วันที่อ้างอิง</Label>
          <Input 
            type="date" 
            value={quotationDate}
            onChange={(e) => setQuotationDate(e.target.value)}
            className="mt-1"
          />
        </div>
        {quotation && (
          <div className="text-right">
             <Label className="text-sm text-muted-foreground">เลขที่ Quotation</Label>
             <p className="font-mono font-medium mt-1">{quotation.quotation_number}</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>รายการบริการ</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            เพิ่มรายการ
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex gap-3 items-start border-b pb-4 sm:pb-3 last:border-0 last:pb-0">
              <div className="flex-1">
                <Textarea
                  placeholder={`รายการที่ ${index + 1} (กด Enter ขึ้นบรรทัดใหม่, - นำหน้าเพื่อย่อยบรรทัด)`}
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <button
                  type="button"
                  onClick={() => updateItem(item.id, "page", (item.page || 1) === 1 ? 2 : 1)}
                  className={`mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                    (item.page || 1) === 1
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  📄 หน้า {item.page || 1}
                </button>
              </div>
              <div className="w-32">
                <div className="flex flex-col gap-2">
                  <Input
                    type="number"
                    placeholder="ราคา"
                    value={item.price || ""}
                    onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                  />
                  <div className="flex items-center space-x-1 border rounded p-1.5 bg-background">
                    <input
                      type="checkbox"
                      id={`hide_price_${item.id}`}
                      checked={item.hide_price || false}
                      onChange={(e) => updateItem(item.id, "hide_price", e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`hide_price_${item.id}`} className="text-xs font-medium cursor-pointer text-muted-foreground">
                      ซ่อนราคา
                    </Label>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="include_vat"
            checked={includeVat}
            onChange={(e) => setIncludeVat(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="include_vat" className="text-sm font-medium leading-none cursor-pointer">
            คำนวณ VAT 7%
          </Label>
        </div>

        <div>
          <Label htmlFor="remarks">Remark (หมายเหตุ)</Label>
          <Textarea
            id="remarks"
            placeholder="เพิ่มหมายเหตุ (จะแสดงใต้รายการบริการ)..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-muted rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Sub Total</span>
          <span>{sub_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        {includeVat && (
          <div className="flex justify-between text-sm">
            <span>VAT 7%</span>
            <span>{vat.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Grand Total</span>
          <span>{grand_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button type="submit">{quotation ? "บันทึกการแก้ไข" : "สร้าง Quotation"}</Button>
      </div>
    </form>
  )
}
