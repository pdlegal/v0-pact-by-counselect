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
      <div className="flex flex-col">
        <PactWordmark variant="light" />
        <span 
          className="text-xs font-normal mt-0.5"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          by Counselect
        </span>
      </div>
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
  const buttonWidth = "220px"
  
  return (
    <section 
      className="flex-1 w-full px-6 py-16 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#431F5D" }}
    >
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
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-4">
        {/* Primary Button Group */}
        <div className="flex flex-col items-center" style={{ width: buttonWidth }}>
          <Link
            href="/generate"
            className="w-full text-center font-medium mb-3"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#431F5D",
              borderRadius: "6px",
              padding: "12px 20px",
              fontSize: "14px"
            }}
          >
            I need an NDA
          </Link>
          <span
            className="font-normal text-center"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "11px",
              lineHeight: 1.5
            }}
          >
            Answer five to ten questions. Receive a ready-to-send NDA.
          </span>
        </div>

        {/* Secondary Button Group */}
        <div className="flex flex-col items-center" style={{ width: buttonWidth }}>
          <Link
            href="/review"
            className="w-full text-center font-normal mb-3"
            style={{
              backgroundColor: "transparent",
              border: "1.5px solid rgba(255,255,255,0.35)",
              color: "rgba(255,255,255,0.85)",
              borderRadius: "6px",
              padding: "12px 20px",
              fontSize: "14px"
            }}
          >
            I need an NDA reviewed
          </Link>
          <span
            className="font-normal text-center"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "11px",
              lineHeight: 1.5
            }}
          >
            {"Upload a counterparty NDA. Receive a reviewed version with TECHNIA's positions applied."}
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
        {"Reviewed against TECHNIA's NDA standards"}
      </p>
    </section>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#431F5D" }}>
      <NavBar />
      <HeroSection />
    </main>
  )
}
