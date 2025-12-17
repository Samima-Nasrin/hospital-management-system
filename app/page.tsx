"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoginPage() {
  const [userId, setUserId] = useState("")
  const [role, setRole] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!userId || !role) {
      setError("Please enter your ID and select a role")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Query the users table to verify credentials
      const { data: user, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .eq("role", role)
        .single()

      if (dbError || !user) {
        throw new Error("Invalid ID or role")
      }

      // Store user info in session storage
      sessionStorage.setItem("currentUser", JSON.stringify(user))

      // Redirect based on role
      switch (role) {
        case "Admin":
          router.push("/dashboard/admin")
          break
        case "Doctor":
          router.push("/dashboard/doctor")
          break
        case "Registrar":
          router.push("/dashboard/registrar")
          break
        case "IPD":
          router.push("/dashboard/ipd")
          break
        default:
          throw new Error("Invalid role")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-8 h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Hospital Management</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-medium text-gray-700">
                User ID
              </Label>
              <Input
                id="userId"
                type="text"
                placeholder="e.g., ADM001, DOC001"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role
              </Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Registrar">Registrar</SelectItem>
                  <SelectItem value="IPD">IPD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">Demo Credentials:</p>
            <div className="mt-2 text-xs text-gray-500 space-y-1 text-center">
              <p>Admin: ADM001 | Doctor: DOC001</p>
              <p>Registrar: REG001 | IPD: IPD001</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
