"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function PactWordmark() {
  return (
    <div className="flex items-center gap-2">
      <span 
        className="font-medium text-xl"
        style={{ color: "#FFFFFF" }}
      >
        Pact
      </span>
      <div 
        className="rounded-full"
        style={{ 
          width: "12px", 
          height: "12px",
          background: "linear-gradient(135deg, #FB6A1B, #D2582F)"
        }}
      />
    </div>
  )
}

function NavBar() {
  return (
    <nav 
      className="flex items-center justify-between px-6 py-4"
      style={{ backgroundColor: "#431F5D" }}
    >
      <Link href="/home">
        <PactWordmark />
      </Link>
      <div className="flex items-center gap-4">
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px" }}>
          Prajoy · Log out
        </span>
      </div>
    </nav>
  )
}

type StepStatus = "complete" | "active" | "pending"

interface ProcessingStepsProps {
  onComplete: () => void
}

function ProcessingSteps({ onComplete }: ProcessingStepsProps) {
  const steps = [
    "NDA received",
    "Identifying clauses",
    "Comparing to TECHNIA's NDA standards...",
    "Checking for consistency",
    "Preparing your deviation summary"
  ]

  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([
    "pending", "pending", "pending", "pending", "pending"
  ])
  const [allComplete, setAllComplete] = useState(false)

  useEffect(() => {
    // Step 1 complete immediately
    setStepStatuses(["complete", "pending", "pending", "pending", "pending"])

    // Step 2 active after mount, complete after 1.5s
    const timer1 = setTimeout(() => {
      setStepStatuses(["complete", "active", "pending", "pending", "pending"])
    }, 100)

    const timer2 = setTimeout(() => {
      setStepStatuses(["complete", "complete", "active", "pending", "pending"])
    }, 1500)

    // Step 3 complete after 4s
    const timer3 = setTimeout(() => {
      setStepStatuses(["complete", "complete", "complete", "active", "pending"])
    }, 4000)

    // Step 4 complete after 6s
    const timer4 = setTimeout(() => {
      setStepStatuses(["complete", "complete", "complete", "complete", "active"])
    }, 6000)

    // Step 5 complete after 8s
    const timer5 = setTimeout(() => {
      setStepStatuses(["complete", "complete", "complete", "complete", "complete"])
      setAllComplete(true)
    }, 8000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [])

  return (
    <div className="flex flex-col">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start">
          {/* Dot and connector column */}
          <div className="flex flex-col items-center mr-4">
            {/* Dot */}
            <div 
              className={`rounded-full flex-shrink-0 ${stepStatuses[index] === "active" ? "animate-pulse" : ""}`}
              style={{ 
                width: "8px", 
                height: "8px",
                background: stepStatuses[index] === "complete" 
                  ? "#431F5D" 
                  : stepStatuses[index] === "active"
                  ? "linear-gradient(135deg, #FB6A1B, #D2582F)"
                  : "#E2E4E8"
              }}
            />
            {/* Connector line (except for last item) */}
            {index < steps.length - 1 && (
              <div 
                style={{ 
                  width: "1px", 
                  height: "28px",
                  backgroundColor: stepStatuses[index] === "complete" ? "#431F5D" : "#E2E4E8"
                }}
              />
            )}
          </div>
          {/* Step label */}
          <span 
            className="font-normal"
            style={{ 
              fontSize: "13px", 
              color: stepStatuses[index] === "pending" ? "#9B9B9B" : "#431F5D",
              paddingBottom: index < steps.length - 1 ? "20px" : "0"
            }}
          >
            {step}
          </span>
        </div>
      ))}

      {/* Completion message with loading counter */}
      {allComplete && (
        <div 
          className="mt-6 pt-4"
          style={{ borderTop: "1px solid #E2E4E8" }}
        >
          <p 
            className="font-normal"
            style={{ fontSize: "13px", color: "#2E7D32" }}
          >
            Your NDA has been reviewed. Loading your results...
          </p>
          <LoadingCounter onComplete={onComplete} />
        </div>
      )}
    </div>
  )
}

interface LoadingCounterProps {
  onComplete: () => void
}

function LoadingCounter({ onComplete }: LoadingCounterProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 5000 // 5 seconds
    const interval = 50 // Update every 50ms
    const increment = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          return 100
        }
        return next
      })
    }, interval)

    // Call onComplete after 5 seconds
    const completeTimer = setTimeout(() => {
      onComplete()
    }, duration)

    return () => {
      clearInterval(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="mt-3 flex items-center gap-3">
      {/* Progress bar */}
      <div 
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: "#E2E4E8" }}
      >
        <div 
          className="h-full rounded-full transition-all duration-50"
          style={{ 
            width: `${progress}%`,
            background: "linear-gradient(135deg, #FB6A1B, #D2582F)"
          }}
        />
      </div>
      {/* Percentage */}
      <span 
        className="font-medium tabular-nums"
        style={{ fontSize: "12px", color: "#431F5D", minWidth: "36px" }}
      >
        {Math.round(progress)}%
      </span>
    </div>
  )
}

export default function ProcessingPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)

  const handleComplete = useCallback(() => {
    setIsProcessing(false)
    router.push("/review/results")
  }, [router])

  // Navigate-away warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault()
        e.returnValue = "Your NDA is still being processed. If you leave now, you'll need to resubmit."
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isProcessing])

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      
      <div className="flex-1 flex items-start justify-center px-4 pt-12 pb-8">
        <div 
          className="w-full"
          style={{ 
            maxWidth: "480px",
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            border: "1px solid #E2E4E8",
            padding: "32px"
          }}
        >
          {/* Heading */}
          <h1 
            className="font-medium mb-2"
            style={{ fontSize: "18px", color: "#431F5D" }}
          >
            Reviewing your NDA
          </h1>
          
          {/* Subtext */}
          <p 
            className="font-normal mb-8"
            style={{ fontSize: "13px", color: "#4A4A6A" }}
          >
            This usually takes under 90 seconds.<br />
            Please don&apos;t close this tab.
          </p>

          {/* Progress Steps */}
          <ProcessingSteps onComplete={handleComplete} />
        </div>
      </div>
    </main>
  )
}
