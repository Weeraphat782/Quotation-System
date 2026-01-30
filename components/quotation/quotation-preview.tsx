"use client"

import { useApp } from "@/lib/app-context"
import type { Quotation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Printer, X, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuotationPreviewProps {
  quotation: Quotation
  onClose?: () => void
}

export default function QuotationPreview({ quotation, onClose }: QuotationPreviewProps) {
  const { companies, customers } = useApp()
  const router = useRouter()

  const company = companies.find((c) => c.id === quotation.company_id)
  const customer = customers.find((c) => c.id === quotation.customer_id)

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const day = d.getDate()
    const month = d.toLocaleString("en-US", { month: "long" })
    const year = d.getFullYear()
    return `${day} ${month} ${year}`
  }

  const handlePrint = () => {
    window.print()
  }

  if (!company || !customer) {
    return <div className="p-8">ไม่พบข้อมูล</div>
  }

  // Get company short name (use full English name as requested)
  const companyShortName = company.name_en

  return (
    <div className="bg-card min-h-screen">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-fixed {
            position: static !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20mm !important;
          }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 bg-card border-b p-4 flex items-center justify-center gap-4 z-10 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-4"
          onClick={() => onClose ? onClose() : router.push("/")}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h3 className="font-semibold hidden sm:block">Quotation Preview</h3>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={handlePrint} className="bg-primary text-primary-foreground">
            <Printer className="w-4 h-4 mr-2" />
            Print to PDF / Printer
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Document Wrapper - Ensure this is NOT 'no-print' or nothing will show in print preview */}
      <div className="py-8 px-4 bg-slate-100 min-h-screen flex justify-center print:p-0 print:bg-white">
        {/* Document - A4 sized container */}
        <div
          className="quotation-document bg-white text-black shadow-xl mx-auto w-[210mm] min-h-[297mm] flex flex-col print:shadow-none print:w-full"
          style={{
            padding: '8mm 20mm 15mm',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div className="relative mb-10 min-h-[100px]">
            {/* Logo in top right - moved further towards paper edge */}
            {company.logo_url && (
              <div className="absolute top-0 right-[-14mm] w-28 h-28 flex justify-end items-start pointer-events-none">
                <img
                  src={company.logo_url}
                  alt="Company Logo"
                  className="max-w-full max-h-full object-contain"
                  style={{ display: 'block' }}
                  onError={(e) => {
                    console.error("QuotationPreview: Failed to load logo", company.logo_url);
                  }}
                />
              </div>
            )}

            <div className="text-center w-full px-4">
              <h1 className="text-black font-bold italic mb-1 whitespace-nowrap" style={{ fontSize: '22pt' }}>
                {company.name_th}
              </h1>
              <h2 className="text-red-600 font-bold italic whitespace-nowrap" style={{ fontSize: '24pt' }}>
                {company.name_en}
              </h2>
            </div>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div className="flex">
              <span className="font-bold w-14">No.</span>
              <span>{quotation.quotation_number}</span>
            </div>
            <div className="text-right">
              <span className="font-bold">Date: </span>
              <span style={{ fontSize: '14pt' }}>{formatDate(quotation.created_at)}</span>
            </div>
          </div>

          <h3 className="text-center font-bold underline mb-6" style={{ fontSize: '16pt' }}>QUOTATION</h3>

          <div className="mb-6 grid grid-cols-12 gap-2">
            <div className="col-span-2 font-bold italic">Company:</div>
            <div className="col-span-10">
              <p className="font-bold">{customer.name}</p>
              <p className="whitespace-pre-line leading-relaxed">{customer.address}</p>
              <p className="mt-1">
                <span className="font-bold italic mr-2">Tax ID:</span> {customer.tax_id}
              </p>
            </div>
          </div>

          <p className="mb-4">
            {companyShortName} is pleased to submit the following quotation for your consideration:
          </p>

          <div className="flex-grow">
            <table className="w-full mb-6" style={{ fontSize: '13pt' }}>
              <thead>
                <tr className="border-y-2 border-black">
                  <th className="text-left py-2 px-2">Service Description</th>
                  <th className="text-right py-2 px-2 w-48">Price (THB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotation.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-2 align-top">
                      <div className="flex gap-3">
                        <span className="mt-1 text-[10px] shrink-0">●</span>
                        <div className="leading-relaxed whitespace-pre-line flex-1">
                          {item.description.split('\n').map((line, i) => {
                            const trimmedLine = line.trim();
                            const isSubItem = trimmedLine.startsWith('-');
                            if (isSubItem) {
                              return (
                                <div key={i} className="flex gap-2 pl-4 mt-0.5 text-gray-700">
                                  <span className="shrink-0">-</span>
                                  <span>{trimmedLine.substring(1).trim()}</span>
                                </div>
                              );
                            }
                            return <div key={i}>{line}</div>;
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-2 px-2 align-top font-mono">
                      {item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-start mb-8 gap-8">
            <div className="flex-1">
              {quotation.remarks && (
                <div className="px-2">
                  <p className="font-bold underline mb-1 italic">Remark:</p>
                  <p className="whitespace-pre-line leading-relaxed text-gray-700">{quotation.remarks}</p>
                </div>
              )}
            </div>
            <div className="w-96">
              <div className="flex justify-between py-1 px-2 border-t border-gray-100">
                <span>Sub Total</span>
                <span className="font-mono">{quotation.sub_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              {quotation.include_vat !== false && (
                <div className="flex justify-between py-1 px-2">
                  <span>Value Added Tax 7%</span>
                  <span className="font-mono">{quotation.vat.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between py-2 px-2 font-bold border-t-2 border-black mt-1">
                <span>Grand Total</span>
                <span className="font-mono">{quotation.grand_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="mb-8 border border-gray-200 p-4 rounded-sm bg-gray-50/50">
            <p className="font-bold underline mb-2">Other Terms and Conditions:</p>
            <ol className="space-y-1.5 ml-1">
              <li className="flex gap-2">
                <span className="font-bold min-w-[150px]">1. Validity of Offer :</span>
                <span>30 days from quotation date</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="font-bold min-w-[150px]">2. Payment Method :</span>
                <div>
                  <p className="text-black">{company.bank_account_name}</p>
                  <p className="text-sm">{company.bank_name} - {company.bank_branch}</p>
                  <p className="font-mono font-bold tracking-wider mt-0.5">
                    A/C No: {company.bank_account_number}
                  </p>
                </div>
              </li>
              {company.boi_exempt && (
                <li className="flex gap-2 text-sm text-blue-800 font-semibold mt-1">
                  <span className="bg-blue-100 px-2 py-0.5 rounded">* บริษัทฯ ได้รับการยกเว้น ภาษีหัก ณ ที่จ่ายจาก BOI</span>
                </li>
              )}
            </ol>
          </div>

          <div className="flex justify-between items-start mt-8 text-base">
            <div className="text-center w-72 relative">
              <p className="mb-2">Yours sincerely,</p>
              <div className="h-10 flex items-center justify-center">
                {company.signature_name && (
                  <span
                    className="text-3xl italic text-blue-900 opacity-80"
                    style={{
                      fontFamily: "'Freestyle Script', 'Brush Script MT', 'Palace Script MT', cursive",
                      transform: "rotate(-2deg)",
                    }}
                  >
                    {company.signature_name}
                  </span>
                )}
              </div>
              <div className="border-b border-black w-full mb-1"></div>
              <p className="font-bold uppercase text-[12px]">{company.name_en}</p>
              <p className="italic text-[12px] mt-1">Authorized Signature</p>
              <p className="font-bold mt-2 text-base">{company.managing_director}</p>
            </div>
            <div className="text-center w-72">
              <p className="mb-2">Quotation Accepted By:</p>
              <div className="h-10"></div> {/* Space for signature to match company side */}
              <div className="border-b border-black w-full mb-1"></div>
              <p className="font-bold uppercase text-[12px]">{customer.name}</p>
              <p className="italic text-[12px] mt-1">Authorized Signature / Date</p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 text-center text-[10px] text-black">
            <p className="mt-0.5">{company.address}</p>
            <p className="mt-0.5 font-mono text-[9px]">Tel: {company.phone} | Email: {company.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
