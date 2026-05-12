"use client"

import Link from "next/link"

function PactWordmark() {
  return (
    <div className="flex items-center gap-1">
      <span 
        className="font-medium text-lg tracking-tight"
        style={{ color: "#FFFFFF" }}
      >
        Pact
      </span>
      <div 
        className="w-2 h-2 rounded-full"
        style={{ 
          background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
          marginTop: "-8px"
        }}
      />
    </div>
  )
}

function NavBar() {
  return (
    <nav 
      className="flex items-center justify-between px-4 py-3"
      style={{ backgroundColor: "#431F5D" }}
    >
      <Link href="/home">
        <PactWordmark />
      </Link>
      <div className="flex items-center gap-2">
        <span 
          className="text-sm"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          Jane Smith
        </span>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}
        >
          JS
        </div>
      </div>
    </nav>
  )
}

export default function GenerateOutputPage() {
  const handleDownloadDocx = () => {
    // Placeholder for download functionality
    console.log("Downloading DOCX...")
  }

  const handleDownloadPdf = () => {
    // Placeholder for download functionality
    console.log("Downloading PDF...")
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      
      <div className="px-4 py-8">
        <div 
          className="mx-auto p-6 rounded-lg"
          style={{ 
            maxWidth: "560px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E4E8"
          }}
        >
          {/* Heading */}
          <h1 
            className="font-medium text-center"
            style={{ fontSize: "20px", color: "#431F5D" }}
          >
            Your NDA is ready
          </h1>
          
          {/* Subheading */}
          <p 
            className="text-center mt-2"
            style={{ fontSize: "13px", color: "#4A4A6A" }}
          >
            {"Drafted to Technia's standard · Mutual NDA · English law · 1-year term"}
          </p>

          {/* Key Terms Cards */}
          <div className="flex gap-3 mt-6 justify-center">
            <div 
              className="px-4 py-2 rounded-md text-center"
              style={{ backgroundColor: "#F3EEF7" }}
            >
              <span 
                className="text-xs font-medium"
                style={{ color: "#431F5D" }}
              >
                Mutual NDA
              </span>
            </div>
            <div 
              className="px-4 py-2 rounded-md text-center"
              style={{ backgroundColor: "#F3EEF7" }}
            >
              <span 
                className="text-xs font-medium"
                style={{ color: "#431F5D" }}
              >
                English law
              </span>
            </div>
            <div 
              className="px-4 py-2 rounded-md text-center"
              style={{ backgroundColor: "#F3EEF7" }}
            >
              <span 
                className="text-xs font-medium"
                style={{ color: "#431F5D" }}
              >
                3-year survival
              </span>
            </div>
          </div>

          {/* Divider */}
          <div 
            className="my-6"
            style={{ height: "0.5px", backgroundColor: "#E2E4E8" }}
          />

          {/* Primary Download Button */}
          <button
            onClick={handleDownloadDocx}
            className="w-full font-medium transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
              color: "#FFFFFF",
              borderRadius: "6px",
              padding: "13px",
              fontSize: "14px"
            }}
          >
            Download NDA (.docx)
          </button>

          {/* Secondary Download Button */}
          <button
            onClick={handleDownloadPdf}
            className="w-full font-normal mt-3 transition-colors hover:bg-gray-50"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E4E8",
              color: "#431F5D",
              borderRadius: "6px",
              padding: "11px",
              fontSize: "14px"
            }}
          >
            Download as PDF
          </button>

          {/* Email Link */}
          <div className="mt-4 text-center">
            <button
              className="hover:underline transition-all"
              style={{ fontSize: "13px", color: "#FB6A1B" }}
            >
              Email this to me
            </button>
          </div>

          {/* Divider */}
          <div 
            className="my-6"
            style={{ height: "0.5px", backgroundColor: "#E2E4E8" }}
          />

          {/* Small Print */}
          <p 
            className="text-center"
            style={{ 
              fontSize: "11px", 
              color: "#4A4A6A",
              lineHeight: 1.6
            }}
          >
            {"This NDA has been drafted to Technia's standard positions. Review it before sending to your counterparty. If you have questions, contact your TECHNIA attorney."}
          </p>

          {/* Return Link */}
          <div className="mt-6 text-center">
            <Link
              href="/home"
              className="hover:underline transition-all"
              style={{ fontSize: "13px", color: "#431F5D" }}
            >
              Generate another NDA
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
