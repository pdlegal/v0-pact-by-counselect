"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span className="text-xl font-medium" style={{ color: "#FFFFFF" }}>Pact</span>
      <span
        className="inline-block rounded-full ml-0.5"
        style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", width: "6px", height: "6px" }}
      />
    </div>
  )
}

function NavBar() {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#431F5D" }}>
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.65)" }}>
        Prajoy · <Link href="/" className="hover:underline">Log out</Link>
      </span>
    </nav>
  )
}

type StepStatus = "pending" | "active" | "complete"
interface Step { label: string; status: StepStatus }

function ProgressStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${step.status === "active" ? "animate-pulse-dot" : ""}`}
              style={{
                background: step.status === "complete"
                  ? "#431F5D"
                  : step.status === "active"
                  ? "linear-gradient(135deg, #FB6A1B, #D2582F)"
                  : "#E2E4E8"
              }}
            />
            {index < steps.length - 1 && (
              <div className="w-px h-6" style={{ backgroundColor: "#E2E4E8" }} />
            )}
          </div>
          <span
            className="text-sm pb-4"
            style={{
              color: step.status === "pending" ? "#9B9B9B" : "#431F5D",
              fontWeight: step.status === "active" ? 500 : 400
            }}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function GenerateProcessingPage() {
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>([
    { label: "Details received", status: "complete" },
    { label: "Selecting the right template...", status: "active" },
    { label: "Applying your NDA positions", status: "pending" },
    { label: "Preparing your NDA", status: "pending" },
  ])
  const [error, setError] = useState<string | null>(null)

  const updateStep = (index: number, status: StepStatus) => {
    setSteps(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], status }
      return updated
    })
  }

  const callWebhook = useCallback(async () => {
    try {
      const raw = sessionStorage.getItem("generateFormData")
      if (!raw) throw new Error("No form data found")
      const formData = JSON.parse(raw)

      // Step 2 active → complete, step 3 active
      setTimeout(() => {
        updateStep(1, "complete")
        updateStep(2, "active")
      }, 1000)

      const response = await fetch("https://prajoyd.app.n8n.cloud/webhook/nda-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Webhook call failed")

      // Step 3 complete, step 4 active
      updateStep(2, "complete")
      updateStep(3, "active")

      // Response is a binary .docx file — convert to base64
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1]
        sessionStorage.setItem("generatedDocx", base64)

        // Step 4 complete, navigate
        updateStep(3, "complete")
        setTimeout(() => {
          router.push("/generate/output")
        }, 800)
      }
      reader.readAsDataURL(blob)

    } catch (err) {
      console.error(err)
      setError("Something went wrong generating your NDA. Please go back and try again.")
    }
  }, [router])

  useEffect(() => {
    callWebhook()
  }, [callWebhook])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "Your NDA is still being generated. If you leave now, you'll need to resubmit."
      return e.returnValue
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
      `}</style>

      <NavBar />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-[480px] rounded-xl p-8"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          <h1 className="font-medium mb-2" style={{ color: "#431F5D", fontSize: "18px" }}>
            Building your NDA
          </h1>
          <p className="mb-8" style={{ color: "#4A4A6A", fontSize: "13px", lineHeight: 1.5 }}>
            This usually takes under 90 seconds.<br />Please don&apos;t close this tab.
          </p>

          <ProgressStepper steps={steps} />

          {error && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "#FFF3E0", border: "1px solid #FFE0B2" }}>
              <p style={{ fontSize: "13px", color: "#E65100" }}>{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-2 underline"
                style={{ fontSize: "13px", color: "#E65100" }}
              >
                Go back
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
