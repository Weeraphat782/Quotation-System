"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Building2, Check, Upload, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function CompanyMaster() {
  const { companies, addCompany, updateCompany, deleteCompany } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    name_th: "",
    name_en: "",
    address: "",
    phone: "",
    email: "",
    tax_id: "",
    bank_name: "",
    bank_branch: "",
    bank_account_name: "",
    bank_account_number: "",
    boi_exempt: false,
    managing_director: "",
    logo_url: "",
    signature_name: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const resetForm = () => {
    setFormData({
      name_th: "",
      name_en: "",
      address: "",
      phone: "",
      email: "",
      tax_id: "",
      bank_name: "",
      bank_branch: "",
      bank_account_name: "",
      bank_account_number: "",
      boi_exempt: false,
      managing_director: "",
      logo_url: "",
      signature_name: "",
    })
    setEditingCompany(null)
    setSelectedFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      console.log("File selected:", file.name)
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      let currentLogoUrl = formData.logo_url

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, selectedFile)

        if (uploadError) {
          throw new Error('Error uploading logo: ' + uploadError.message)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath)

        currentLogoUrl = publicUrl
      }

      const finalData = { ...formData, logo_url: currentLogoUrl }

      if (editingCompany) {
        await updateCompany(editingCompany.id, finalData)
      } else {
        await addCompany(finalData)
      }
      setIsOpen(false)
      resetForm()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name_th: company.name_th,
      name_en: company.name_en,
      address: company.address,
      phone: company.phone,
      email: company.email,
      tax_id: company.tax_id,
      bank_name: company.bank_name,
      bank_branch: company.bank_branch,
      bank_account_name: company.bank_account_name,
      bank_account_number: company.bank_account_number,
      boi_exempt: company.boi_exempt,
      managing_director: company.managing_director,
      logo_url: company.logo_url || "",
      signature_name: company.signature_name || "",
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("ต้องการลบบริษัทนี้หรือไม่?")) {
      await deleteCompany(id)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">จัดการบริษัท</h2>
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
              เพิ่มบริษัท
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCompany ? "แก้ไขบริษัท" : "เพิ่มบริษัทใหม่"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_th">ชื่อบริษัท (ไทย)</Label>
                  <Input
                    id="name_th"
                    value={formData.name_th}
                    onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">ชื่อบริษัท (English)</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทร</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managing_director">Managing Director</Label>
                  <Input
                    id="managing_director"
                    value={formData.managing_director}
                    onChange={(e) => setFormData({ ...formData, managing_director: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">โลโก้บริษัท</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                    {selectedFile ? (
                      <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-contain" />
                    ) : formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      แนะนำไฟล์ PNG หรือ JPG ขนาดไม่เกิน 2MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature_name">ชื่อลายเซ็น (Signature Name)</Label>
                <Input
                  id="signature_name"
                  placeholder="เช่น Mr. Somchai S."
                  value={formData.signature_name}
                  onChange={(e) => setFormData({ ...formData, signature_name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ชื่อที่จะปรากฏในช่องลายเซ็น (จะแสดงเป็นฟอนต์ตัวเขียน)
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">ข้อมูลธนาคาร</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">ชื่อธนาคาร</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_branch">สาขา</Label>
                    <Input
                      id="bank_branch"
                      value={formData.bank_branch}
                      onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">ชื่อบัญชี</Label>
                    <Input
                      id="bank_account_name"
                      value={formData.bank_account_name}
                      onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number">เลขที่บัญชี</Label>
                    <Input
                      id="bank_account_number"
                      value={formData.bank_account_number}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 border-t pt-4">
                <Checkbox
                  id="boi_exempt"
                  checked={formData.boi_exempt}
                  onCheckedChange={(checked) => setFormData({ ...formData, boi_exempt: checked as boolean })}
                />
                <Label htmlFor="boi_exempt" className="text-sm">
                  บริษัทฯ ได้รับการยกเว้นภาษีหัก ณ ที่จ่ายจาก BOI
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCompany ? "บันทึก" : "เพิ่ม"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {companies.map((company) => (
          <div key={company.id} className="bg-card rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{company.name_th}</h3>
                  <p className="text-sm text-muted-foreground italic">{company.name_en}</p>
                  <p className="text-sm text-muted-foreground mt-1">{company.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>Tel: {company.phone}</span>
                    <span>Email: {company.email}</span>
                  </div>
                  {company.boi_exempt && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-chart-2">
                      <Check className="w-4 h-4" />
                      ได้รับการยกเว้นภาษีหัก ณ ที่จ่ายจาก BOI
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(company.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">ยังไม่มีข้อมูลบริษัท คลิก "เพิ่มบริษัท" เพื่อเริ่มต้น</div>
        )}
      </div>
    </div>
  )
}
