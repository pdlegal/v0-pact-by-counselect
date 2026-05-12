"use client"

import Link from "next/link"

function PactWordmark({ variant = "light" }: { variant?: "light" | "dark" }) {
  const textColor = variant === "light" ? "#FFFFFF" : "#431F5D"
  
  return (
    <div className="flex items-center gap-1">
      <span 
        className="text-xl font-medium"
        style={{ color: textColor }}
      >
        Pact
      </span>
      <div 
        className="w-3 h-3 rounded-full"
        style={{ 
          background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
        }}
      />
    </div>
  )
}

function NavBar() {
  return (
    <nav 
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: "#431F5D" }}
    >
      <PactWordmark variant="light" />
      <span 
        className="text-xs font-normal"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        Prajoy · <Link href="/" className="hover:underline">Log out</Link>
      </span>
    </nav>
  )
}

function HeroSection() {
  return (
    <section 
      className="w-full px-6 py-16 flex flex-col items-center"
      style={{ backgroundColor: "#431F5D" }}
    >
      {/* Eyebrow */}
      <span
        className="font-medium uppercase mb-3"
        style={{ 
          color: "#FB6A1B", 
          fontSize: "11px",
          letterSpacing: "0.08em"
        }}
      >
        by Counselect
      </span>

      {/* Headline */}
      <h1 
        className="font-medium text-center mb-3"
        style={{ 
          color: "#FFFFFF",
          fontSize: "28px"
        }}
      >
        Every deal starts here.
      </h1>

      {/* Subline */}
      <p 
        className="font-normal text-center mb-8"
        style={{ 
          color: "rgba(255,255,255,0.65)",
          fontSize: "14px",
          maxWidth: "320px"
        }}
      >
        Trusted counsel, from the very first signature.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-2.5">
        {/* Primary Button Group */}
        <div className="flex flex-col items-center">
          <button
            className="font-medium mb-2"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#431F5D",
              borderRadius: "6px",
              padding: "10px 20px",
              fontSize: "14px"
            }}
          >
            I need an NDA
          </button>
          <span
            className="font-normal text-center max-w-[200px]"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "11px"
            }}
          >
            Answer five to ten questions. Receive a ready-to-send NDA.
          </span>
        </div>

        {/* Secondary Button Group */}
        <div className="flex flex-col items-center">
          <button
            className="font-normal mb-2"
            style={{
              backgroundColor: "transparent",
              border: "1.5px solid rgba(255,255,255,0.35)",
              color: "rgba(255,255,255,0.85)",
              borderRadius: "6px",
              padding: "10px 20px",
              fontSize: "14px"
            }}
          >
            I need an NDA reviewed
          </button>
          <span
            className="font-normal text-center max-w-[200px]"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "11px"
            }}
          >
            {"Upload a counterparty NDA. Receive a reviewed version with Technia's positions applied."}
          </span>
        </div>
      </div>

      {/* Assurance text */}
      <p
        className="font-normal text-center mt-10"
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "11px"
        }}
      >
        {"Reviewed against Technia's NDA standards"}
      </p>
    </section>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      <HeroSection />
    </main>
  )
}
