"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Pact wordmark component
function PactWordmark() {
  return (
    <div className="flex items-center gap-1">
      <span 
        className="text-xl font-medium tracking-tight"
        style={{ color: "#FFFFFF" }}
      >
        Pact
      </span>
      <span
        className="w-[6px] h-[6px] rounded-full -mt-2"
        style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)" }}
      />
    </div>
  )
}

// Nav bar component
function NavBar() {
  return (
    <nav 
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: "#431F5D" }}
    >
      <Link href="/home">
        <PactWordmark />
      </Link>
      <div className="flex items-center gap-3">
        <span 
          className="text-sm"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          Sarah Chen
        </span>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}
        >
          SC
        </div>
      </div>
    </nav>
  )
}

type StepStatus = "pending" | "active" | "complete"

interface Step {
  label: string
  status: StepStatus
}

// Progress stepper component
function ProgressStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          {/* Dot and connector */}
          <div className="flex flex-col items-center">
            <div 
              className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                step.status === "active" ? "animate-pulse-dot" : ""
              }`}
              style={{
                background: step.status === "complete" 
                  ? "#431F5D" 
                  : step.status === "active"
                  ? "linear-gradient(135deg, #FB6A1B, #D2582F)"
                  : "#E2E4E8"
              }}
            />
            {index < steps.length - 1 && (
              <div 
                className="w-px h-6"
                style={{ backgroundColor: "#E2E4E8" }}
              />
            )}
          </div>
          
          {/* Label */}
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

// Loading counter component
function LoadingCounter({ onComplete }: { onComplete: () => void }) {
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

// Completion message component
function CompletionMessage({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E2E4E8" }}>
      <div className="flex items-center gap-2">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
          style={{ color: "#1B5E20" }}
        >
          <path 
            d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM6.4 12L2.4 8L3.52 6.88L6.4 9.76L12.48 3.68L13.6 4.8L6.4 12Z" 
            fill="currentColor"
          />
        </svg>
        <span 
          className="text-[13px]"
          style={{ color: "#1B5E20" }}
        >
          Your NDA is ready. Loading your download...
        </span>
      </div>
      <LoadingCounter onComplete={onComplete} />
    </div>
  )
}

export default function GenerateProcessingPage() {
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>([
    { label: "Details received", status: "complete" },
    { label: "Selecting the right template...", status: "pending" },
    { label: "Applying Technia's NDA positions", status: "pending" },
    { label: "Preparing your NDA", status: "pending" }
  ])
  const [isComplete, setIsComplete] = useState(false)

  const handleNavigateToOutput = () => {
    router.push("/generate/output")
  }

  // Animation timeline
  useEffect(() => {
    const timeline = [
      // Step 2 active at 1s
      { time: 1000, stepIndex: 1, status: "active" as StepStatus },
      // Step 2 complete, Step 3 active at 3s
      { time: 3000, stepIndex: 1, status: "complete" as StepStatus },
      { time: 3000, stepIndex: 2, status: "active" as StepStatus },
      // Step 3 complete, Step 4 active at 6s
      { time: 6000, stepIndex: 2, status: "complete" as StepStatus },
      { time: 6000, stepIndex: 3, status: "active" as StepStatus },
      // Step 4 complete at 8s
      { time: 8000, stepIndex: 3, status: "complete" as StepStatus }
    ]

    const timeouts: NodeJS.Timeout[] = []

    timeline.forEach(({ time, stepIndex, status }) => {
      const timeout = setTimeout(() => {
        setSteps(prev => {
          const newSteps = [...prev]
          newSteps[stepIndex] = { ...newSteps[stepIndex], status }
          return newSteps
        })
      }, time)
      timeouts.push(timeout)
    })

    // Show completion message after all steps done
    const completeTimeout = setTimeout(() => {
      setIsComplete(true)
    }, 8500)
    timeouts.push(completeTimeout)

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  // Navigate-away warning
  useEffect(() => {
    if (isComplete) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "Your NDA is still being generated. If you leave now, you'll need to resubmit."
      return e.returnValue
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isComplete])

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
          className="w-full max-w-[480px] rounded-xl p-8"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          {/* Heading */}
          <h1 
            className="font-medium mb-2"
            style={{ color: "#431F5D", fontSize: "18px" }}
          >
            Building your NDA
          </h1>
          
          {/* Subtext */}
          <p 
            className="mb-8"
            style={{ color: "#4A4A6A", fontSize: "13px", lineHeight: 1.5 }}
          >
            This usually takes under 90 seconds.<br />
            Please don&apos;t close this tab.
          </p>
          
          {/* Progress stepper */}
          <ProgressStepper steps={steps} />
          
          {/* Completion message */}
          {isComplete && <CompletionMessage onComplete={handleNavigateToOutput} />}
        </div>
      </div>
    </main>
  )
}
