// Database Types - aligned with Supabase/PostgreSQL schema

export interface Employee {
  id: string
  username: string
  password?: string // Omitted in most fetches
  full_name: string
  email: string
  role: "admin" | "staff"
  created_at: string | Date
}

export interface Company {
  id: string
  name_th: string
  name_en: string
  address: string
  phone: string
  email: string
  tax_id: string
  bank_name: string
  bank_branch: string
  bank_account_name: string
  bank_account_number: string
  boi_exempt: boolean // BOI tax exemption
  managing_director: string
  signature_url?: string
  created_at: string | Date
}

export interface Customer {
  id: string
  name: string
  address: string
  tax_id: string
  contact_person?: string
  phone?: string
  email?: string
  created_at: string | Date
}

export interface QuotationItem {
  id: string
  quotation_id?: string
  description: string
  price: number
}

export interface Quotation {
  id: string
  quotation_number: string // YYYYMM-RunNo format
  company_id: string
  customer_id: string
  opportunity_id: string
  items?: QuotationItem[] // Joined items
  sub_total: number
  vat: number // 7%
  grand_total: number
  revision: number
  status: "draft" | "sent" | "accepted" | "rejected"
  created_at: string | Date
  created_by: string
}

export interface Opportunity {
  id: string
  title: string
  customer_id: string
  company_id: string
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost"
  quotations?: string[] // Optional array of quotation IDs or joined objects
  notes?: string
  created_at: string | Date
  created_by: string
}
