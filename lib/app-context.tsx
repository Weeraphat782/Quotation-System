"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Company, Customer, Employee, Opportunity, Quotation } from "./types"
import { supabase } from "./supabase"

interface AppState {
  currentUser: Employee | null
  employees: Employee[]
  companies: Company[]
  customers: Customer[]
  opportunities: Opportunity[]
  quotations: Quotation[]
  loading: boolean
}

interface AppContextType extends AppState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  // Employee CRUD
  addEmployee: (employee: Omit<Employee, "id" | "created_at">) => Promise<void>
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
  // Company CRUD
  addCompany: (company: Omit<Company, "id" | "created_at">) => Promise<void>
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>
  // Customer CRUD
  addCustomer: (customer: Omit<Customer, "id" | "created_at">) => Promise<void>
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  // Opportunity CRUD
  addOpportunity: (opportunity: Omit<Opportunity, "id" | "created_at">) => Promise<void>
  updateOpportunity: (id: string, opportunity: Partial<Opportunity>) => Promise<void>
  deleteOpportunity: (id: string) => Promise<void>
  moveOpportunityStage: (id: string, stage: Opportunity["stage"]) => Promise<void>
  // Quotation CRUD
  addQuotation: (quotation: Omit<Quotation, "id" | "quotation_number" | "created_at">) => Promise<void>
  updateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<void>
  deleteQuotation: (id: string) => Promise<void>
  generateQuotationNumber: () => Promise<string>
  fetchData: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    employees: [],
    companies: [],
    customers: [],
    opportunities: [],
    quotations: [],
    loading: true,
  })

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const { data: employees } = await supabase.from("employees").select("*")
      const { data: companies } = await supabase.from("companies").select("*")
      const { data: customers } = await supabase.from("customers").select("*")
      const { data: opportunities } = await supabase.from("opportunities").select("*")
      const { data: quotations } = await supabase.from("quotations").select("*, items:quotation_items(*)")

      setState((prev) => ({
        ...prev,
        employees: employees || [],
        companies: companies || [],
        customers: customers || [],
        opportunities: opportunities || [],
        quotations: quotations || [],
        loading: false,
      }))
    } catch (error) {
      console.error("Error fetching data:", error)
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem("quotation_user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setState((prev) => ({ ...prev, currentUser: user }))
      } catch (e) {
        console.error("Error parsing saved user:", e)
        localStorage.removeItem("quotation_user")
      }
    }
    fetchData()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, use Supabase Auth. For this prototype, we'll check the employees table.
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    if (data && !error) {
      setState((prev) => ({ ...prev, currentUser: data }))
      localStorage.setItem("quotation_user", JSON.stringify(data))
      return true
    }
    return false
  }

  const logout = () => {
    setState((prev) => ({ ...prev, currentUser: null }))
    localStorage.removeItem("quotation_user")
  }

  const generateQuotationNumber = async (): Promise<string> => {
    const now = new Date()
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`

    const { data } = await supabase
      .from("quotations")
      .select("quotation_number")
      .ilike("quotation_number", `${yearMonth}-%`)
      .order("quotation_number", { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (data && data.length > 0) {
      const lastNumber = parseInt(data[0].quotation_number.split("-")[1])
      nextNumber = lastNumber + 1
    }

    return `${yearMonth}-${String(nextNumber).padStart(4, "0")}`
  }

  // Employee CRUD
  const addEmployee = async (employee: Omit<Employee, "id" | "created_at">) => {
    const { error } = await supabase.from("employees").insert([employee])
    if (!error) await fetchData()
  }

  const updateEmployee = async (id: string, employee: Partial<Employee>) => {
    const { error } = await supabase.from("employees").update(employee).eq("id", id)
    if (!error) await fetchData()
  }

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from("employees").delete().eq("id", id)
    if (!error) await fetchData()
  }

  // Company CRUD
  const addCompany = async (company: Omit<Company, "id" | "created_at">) => {
    const { error } = await supabase.from("companies").insert([company])
    if (!error) await fetchData()
  }

  const updateCompany = async (id: string, company: Partial<Company>) => {
    const { error } = await supabase.from("companies").update(company).eq("id", id)
    if (!error) await fetchData()
  }

  const deleteCompany = async (id: string) => {
    const { error } = await supabase.from("companies").delete().eq("id", id)
    if (!error) await fetchData()
  }

  // Customer CRUD
  const addCustomer = async (customer: Omit<Customer, "id" | "created_at">) => {
    const { error } = await supabase.from("customers").insert([customer])
    if (!error) await fetchData()
  }

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    const { error } = await supabase.from("customers").update(customer).eq("id", id)
    if (!error) await fetchData()
  }

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id)
    if (!error) await fetchData()
  }

  // Opportunity CRUD
  const addOpportunity = async (opportunity: Omit<Opportunity, "id" | "created_at">) => {
    const { error } = await supabase.from("opportunities").insert([opportunity])
    if (!error) await fetchData()
  }

  const updateOpportunity = async (id: string, opportunity: Partial<Opportunity>) => {
    const { error } = await supabase.from("opportunities").update(opportunity).eq("id", id)
    if (!error) await fetchData()
  }

  const deleteOpportunity = async (id: string) => {
    const { error } = await supabase.from("opportunities").delete().eq("id", id)
    if (!error) await fetchData()
  }

  const moveOpportunityStage = async (id: string, stage: Opportunity["stage"]) => {
    await updateOpportunity(id, { stage })
  }

  // Quotation CRUD
  const addQuotation = async (quotation: Omit<Quotation, "id" | "quotation_number" | "created_at">) => {
    const quotation_number = await generateQuotationNumber()
    const { items, ...quotationData } = quotation

    const { data: newQuotation, error } = await supabase
      .from("quotations")
      .insert([{ ...quotationData, quotation_number }])
      .select()
      .single()

    if (newQuotation && !error && items) {
      const itemsToInsert = items.map(item => ({
        quotation_id: newQuotation.id,
        description: item.description,
        price: item.price
      }))
      await supabase.from("quotation_items").insert(itemsToInsert)
    }

    if (!error) await fetchData()
  }

  const updateQuotation = async (id: string, quotation: Partial<Quotation>) => {
    const { error } = await supabase.from("quotations").update(quotation).eq("id", id)
    if (!error) await fetchData()
  }

  const deleteQuotation = async (id: string) => {
    const { error } = await supabase.from("quotations").delete().eq("id", id)
    if (!error) await fetchData()
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addCompany,
        updateCompany,
        deleteCompany,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOpportunity,
        updateOpportunity,
        deleteOpportunity,
        moveOpportunityStage,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        generateQuotationNumber,
        fetchData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
