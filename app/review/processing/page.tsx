"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const WEBHOOK_URL = "https://prajoyd.app.n8n.cloud/webhook/nda-upload"
const TARGET_SECONDS = 90

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
interface Step { label: string; sublabel: string; status: StepStatus }

const STEPS: Step[] = [
  {
    label: "NDA received",
    sublabel: "Your document is in the queue.",
    status: "complete"
  },
  {
    label: "Reading the counterparty's draft",
    sublabel: "Verifying this is an NDA and extracting the text.",
    status: "pending"
  },
  {
    label: "Identifying clauses",
    sublabel: "Mapping confidentiality, IP, term, survival, and governing law.",
    status: "pending"
  },
  {
    label: "Comparing against TECHNIA's positions",
    sublabel: "Checking each clause against 12 playbook positions.",
    status: "pending"
  },
  {
    label: "Checking for consistency",
    sublabel: "A second pass to catch anything missed.",
    status: "pending"
  },
  {
    label: "Preparing your risk summary",
    sublabel: "Almost done — building your key risks table.",
    status: "pending"
  }
]

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
    <div
      className="mt-6 pt-5 flex items-center justify-between"
      style={{ borderTop: "1px solid #F0F0F0" }}
    >
      <p className="text-xs" style={{ color: "#9B9B9B" }}>
        {secondsLeft > 0
          ? `About ${secondsLeft} second${secondsLeft !== 1 ? "s" : ""} remaining`
          : "Almost there..."}
      </p>
      <div
        className="h-1 rounded-full overflow-hidden flex-1 ml-4"
        style={{ backgroundColor: "#F0F0F0" }}
      >
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

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function ReviewProcessingPage() {
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>(STEPS)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [startTime] = useState(Date.now())

  const advanceStep = (stepIndex: number, status: StepStatus) => {
    setSteps(prev => {
      const newSteps = [...prev]
      newSteps[stepIndex] = { ...newSteps[stepIndex], status }
      return newSteps
    })
  }

  const submitToWebhook = useCallback(async () => {
    try {
      const fileData = sessionStorage.getItem("review_file_data")
      const fileName = sessionStorage.getItem("review_file_name")
      const fileType = sessionStorage.getItem("review_file_type")
      const contextRaw = sessionStorage.getItem("review_context")

      if (!fileData || !fileName || !fileType || !contextRaw) {
        setError("Session data missing. Please go back and resubmit.")
        return
      }

      const context = JSON.parse(contextRaw)
      const res = await fetch(fileData)
      const blob = await res.blob()
      const file = new File([blob], fileName, { type: fileType })

      const formData = new FormData()
      formData.append("data", file)
      formData.append("client_id", context.client_id || "technia")
      formData.append("counterparty_name", context.counterpartyName)
      formData.append("party_type", context.partyType)
      formData.append("sharing_direction", context.sharingDirection)
      formData.append("engagement_type", context.engagementType)
      formData.append("duration", `${context.durationValue} ${context.durationUnit}`)
      formData.append("country", context.country.name)

      advanceStep(1, "active")
      await delay(1500)
      advanceStep(1, "complete")
      advanceStep(2, "active")

      const response = await fetch(WEBHOOK_URL, { method: "POST", body: formData })
      if (!response.ok) throw new Error("The server returned an error. Please try again.")
      const result = await response.json()

      advanceStep(2, "complete")
      advanceStep(3, "active")
      await delay(800)
      advanceStep(3, "complete")
      advanceStep(4, "active")
      await delay(600)
      advanceStep(4, "complete")
      advanceStep(5, "active")
      await delay(600)
      advanceStep(5, "complete")

      const data = Array.isArray(result) ? result[0] : result
      sessionStorage.setItem("review_result", JSON.stringify(data))
      sessionStorage.setItem("review_counterparty_name", context.counterpartyName)

      setDone(true)
      await delay(500)
      router.push("/review/results")

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }
  }, [router])

  useEffect(() => {
    submitToWebhook()
  }, [submitToWebhook])

  useEffect(() => {
    if (error) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "Your NDA is still being processed. If you leave now, you'll need to resubmit."
      return e.returnValue
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
      `}</style>

      <NavBar />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-[520px] rounded-xl p-8"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          <h1 className="font-medium mb-1" style={{ color: "#431F5D", fontSize: "18px" }}>
            Reviewing your NDA
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
                style={{ backgroundColor: "#FFEBEE", border: "1px solid #FFCDD2" }}
              >
                <p style={{ color: "#B71C1C", fontSize: "13px" }}>{error}</p>
              </div>
              <button
                onClick={() => router.push("/review")}
                className="w-full py-3 rounded-md font-medium text-white"
                style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", fontSize: "14px" }}
              >
                Go back and resubmit
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
