"use client"

import { useApp } from "@/lib/app-context"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const { currentUser } = useApp()

  if (!currentUser) {
    return <LoginPage />
  }

  return <Dashboard />
}
