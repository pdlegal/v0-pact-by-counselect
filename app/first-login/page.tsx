"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

function PactWordmark() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-baseline">
        <span
          className="text-2xl font-medium"
          style={{ color: "#431F5D" }}
        >
          Pact
        </span>
        <span
          className="inline-block rounded-full ml-0.5"
          style={{
            background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
            width: "8px",
            height: "8px"
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span style={{ color: "#9B9B9B", fontSize: "11px" }}>by</span>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_actual%20colours%404x-6LAad0QHNxezqbH0koD47Bfz5Wwjr3.png"
          alt="Counselect"
          width={70}
          height={18}
          className="object-contain"
          style={{ marginTop: "-2px" }}
          unoptimized
        />
      </div>
    </div>
  )
}

export default function FirstLoginPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { firstName?: string; lastName?: string } = {}
    if (!firstName.trim()) newErrors.firstName = "Please enter your first name"
    if (!lastName.trim()) newErrors.lastName = "Please enter your last name"

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)

    // Will call /api/auth/update-name once backend is wired
    // For now, simulate and redirect
    setTimeout(() => {
      router.push("/home")
    }, 500)
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F7F8FA" }}
    >
      <div
        className="w-full max-w-[380px] px-8 py-10"
        style={{
          backgroundColor: "#FFFFFF",
          border: "0.5px solid #E2E4E8",
          borderRadius: "10px"
        }}
      >
        {/* Wordmark */}
        <div className="flex justify-center mb-8">
          <PactWordmark />
        </div>

        {/* Heading */}
        <h1
          className="font-medium text-center mb-2"
          style={{ color: "#431F5D", fontSize: "18px" }}
        >
          Welcome to Pact
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: "#4A4A6A", fontSize: "13px", lineHeight: 1.6 }}
        >
          Before we get started, what is your name?
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First name */}
          <div className="space-y-1">
            <label
              className="block font-normal"
              style={{ color: "#431F5D", fontSize: "13px" }}
            >
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                if (errors.firstName) setErrors(prev => ({ ...prev, firstName: undefined }))
              }}
              placeholder="e.g. Sarah"
              autoFocus
              className="w-full px-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: "#F7F8FA",
                border: errors.firstName ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
                borderRadius: "6px",
                color: "#431F5D"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FB6A1B"
                e.target.style.boxShadow = "0 0 0 2px rgba(251, 106, 27, 0.2)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.firstName ? "#B71C1C" : "#E2E4E8"
                e.target.style.boxShadow = "none"
              }}
            />
            {errors.firstName && (
              <span style={{ color: "#B71C1C", fontSize: "12px" }}>
                {errors.firstName}
              </span>
            )}
          </div>

          {/* Last name */}
          <div className="space-y-1">
            <label
              className="block font-normal"
              style={{ color: "#431F5D", fontSize: "13px" }}
            >
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }))
              }}
              placeholder="e.g. Chen"
              className="w-full px-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: "#F7F8FA",
                border: errors.lastName ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
                borderRadius: "6px",
                color: "#431F5D"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FB6A1B"
                e.target.style.boxShadow = "0 0 0 2px rgba(251, 106, 27, 0.2)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.lastName ? "#B71C1C" : "#E2E4E8"
                e.target.style.boxShadow = "none"
              }}
            />
            {errors.lastName && (
              <span style={{ color: "#B71C1C", fontSize: "12px" }}>
                {errors.lastName}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 font-medium mt-2 transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
              color: "#FFFFFF",
              borderRadius: "6px",
              fontSize: "14px",
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? "Saving..." : "Get started"}
          </button>
        </form>

        {/* Footer note */}
        <p
          className="text-center mt-6"
          style={{ color: "#9B9B9B", fontSize: "11px", lineHeight: 1.6 }}
        >
          Your name appears in the audit trail for every NDA you action.
        </p>
      </div>
    </main>
  )
}
