"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const TARGET_SECONDS = 45

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

function NavBar({ firstName, lastName, clientName }: { firstName: string; lastName: string; clientName: string }) {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#431F5D" }}>
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.65)" }}>
        {firstName && lastName ? `${firstName} ${lastName}` : "..."} · {clientName || ""} · <Link href="/" className="hover:underline">Log out</Link>
      </span>
    </nav>
  )
}

type StepStatus = "pending" | "active" | "complete"
interface Step { label: string; sublabel: string; status: StepStatus }

function buildSteps(clientName: string): Step[] {
  return [
    {
      label: "Details received",
      sublabel: "Your form data is ready to process.",
      status: "complete"
    },
    {
      label: "Selecting the right template",
      sublabel: "Choosing the correct NDA structure based on your inputs.",
      status: "pending"
    },
    {
      label: `Applying ${clientName || "your company"}'s positions`,
      sublabel: "Populating clauses with your entity details, purpose, and governing law.",
      status: "pending"
    },
    {
      label: "Preparing your NDA",
      sublabel: "Finalising the document and making it ready to download.",
      status: "pending"
    }
  ]
}

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
              <div className="w-px h-8" style={{ backgroundColor: "#E2E4E8" }} />
            )}
          </div>
          <div className="pb-5">
            <p
              className="text-sm"
              style={{
                color: step.status === "pending" ? "#9B9B9B" : "#431F5D",
                fontWeight: step.status === "active" ? 500 : 400
              }}
            >
              {step.label}
            </p>
            {step.status !== "pending" && (
              <p className="text-xs mt-0.5" style={{ color: "#9B9B9B" }}>
                {step.sublabel}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Countdown({ startTime, done }: { startTime: number; done: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(TARGET_SECONDS)

  useEffect(() => {
    if (done) { setSecondsLeft(0); return }
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, TARGET_SECONDS - elapsed)
      setSecondsLeft(remaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, done])

  if (done) return null

  return (
    <div className="mt-6 pt-5 flex items-center justify-between" style={{ borderTop: "1px solid #F0F0F0" }}>
      <p className="text-xs" style={{ color: "#9B9B9B" }}>
        {secondsLeft > 0
          ? `About ${secondsLeft} second${secondsLeft !== 1 ? "s" : ""} remaining`
          : "Almost there..."}
      </p>
      <div className="h-1 rounded-full overflow-hidden flex-1 ml-4" style={{ backgroundColor: "#F0F0F0" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(100, ((TARGET_SECONDS - secondsLeft) / TARGET_SECONDS) * 100)}%`,
            background: "linear-gradient(90deg, #FB6A1B, #D2582F)"
          }}
        />
      </div>
    </div>
  )
}

export default function GenerateProcessingPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clientName, setClientName] = useState("")
  const [steps, setSteps] = useState<Step[]>(buildSteps(""))
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [startTime] = useState(Date.now())

  // Load client data and rebuild steps with client name
  useEffect(() => {
    async function loadClientData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name, client_id")
        .eq("id", session.user.id)
        .single()

      if (!userData) return
      setFirstName(userData.first_name || "")
      setLastName(userData.last_name || "")

      const { data: clientData } = await supabase
        .from("clients")
        .select("display_name")
        .eq("id", userData.client_id)
        .single()

      if (clientData) {
        setClientName(clientData.display_name || "")
        setSteps(buildSteps(clientData.display_name || ""))
      }
    }

    loadClientData()
  }, [])

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

      updateStep(1, "active")
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

      updateStep(2, "complete")
      updateStep(3, "active")

      const blob = await response.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1]
        sessionStorage.setItem("generatedDocx", base64)
        updateStep(3, "complete")
        setDone(true)
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

      <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-[520px] rounded-xl p-8"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          <h1 className="font-medium mb-1" style={{ color: "#431F5D", fontSize: "18px" }}>
            Building your NDA
          </h1>

          {!error ? (
            <>
              <p className="mb-8" style={{ color: "#9B9B9B", fontSize: "13px" }}>
                Please don&apos;t close this tab.
              </p>
              <ProgressStepper steps={steps} />
              <Countdown startTime={startTime} done={done} />
            </>
          ) : (
            <div className="mt-4">
              <div
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: "#FFF3E0", border: "1px solid #FFE0B2" }}
              >
                <p style={{ fontSize: "13px", color: "#E65100" }}>{error}</p>
              </div>
              <button
                onClick={() => router.back()}
                className="w-full py-3 rounded-md font-medium text-white"
                style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", fontSize: "14px" }}
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
