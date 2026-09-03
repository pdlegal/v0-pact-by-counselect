"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type EngagementType =
  | "exploring"
  | "evaluating"
  | "sharing_data"
  | "something_else"
  | ""

type InformationType =
  | "software"
  | "customer_data"
  | "employee_data"
  | "branding"
  | "financial"
  | "none"

type DurationUnit = "weeks" | "months" | "years"

// ─────────────────────────────────────────────
// CLAUSE TRIGGER LOGIC
// ─────────────────────────────────────────────

function getTriggeredClauses(informationTypes: InformationType[]) {
  const ipTriggered = informationTypes.includes("software")
  const dataPrivacyTriggered =
    informationTypes.includes("customer_data") ||
    informationTypes.includes("employee_data")
  return { ipTriggered, dataPrivacyTriggered }
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span className="text-xl font-medium" style={{ color: "#FFFFFF" }}>
        Pact
      </span>
      <span
        className="inline-block rounded-full ml-0.5"
        style={{
          background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
          width: "6px",
          height: "6px"
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
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.65)" }}>
        Prajoy · <Link href="/" className="hover:underline">Log out</Link>
      </span>
    </nav>
  )
}

function ProgressIndicator({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100
  return (
    <div className="mb-6">
      <span className="font-normal" style={{ color: "#4A4A6A", fontSize: "12px" }}>
        Step {step} of {totalSteps}
      </span>
      <div className="mt-2 w-full h-[3px] rounded-full" style={{ backgroundColor: "#E2E4E8" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #FB6A1B, #D2582F)"
          }}
        />
      </div>
    </div>
  )
}

// Full-width flush section band
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-medium uppercase -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 mt-8 mb-6 text-center"
      style={{
        fontSize: "11px",
        color: "#431F5D",
        letterSpacing: "0.08em",
        backgroundColor: "#F3EEF7",
        borderTop: "0.5px solid #E2E4E8",
        borderBottom: "0.5px solid #E2E4E8"
      }}
    >
      {children}
    </div>
  )
}

// Larger, bolder question label
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block font-medium mb-3"
      style={{ color: "#431F5D", fontSize: "15px" }}
    >
      {children}
    </label>
  )
}

function FieldHelper({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-normal mt-1.5" style={{ color: "#4A4A6A", fontSize: "12px" }}>
      {children}
    </p>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <span style={{ color: "#B71C1C", fontSize: "12px" }}>{message}</span>
  )
}

function RadioCard({
  label,
  sublabel,
  selected,
  onClick,
  fullWidth = false
}: {
  label: string
  sublabel?: string
  selected: boolean
  onClick: () => void
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-lg text-left transition-all ${fullWidth ? "w-full" : ""}`}
      style={{
        backgroundColor: selected ? "#F3EEF7" : "#FFFFFF",
        border: selected ? "1.5px solid #431F5D" : "0.5px solid #E2E4E8",
        color: "#431F5D",
        fontSize: "14px"
      }}
    >
      <span className="font-normal block">{label}</span>
      {sublabel && (
        <span className="font-normal block mt-0.5" style={{ fontSize: "12px", color: "#4A4A6A" }}>
          {sublabel}
        </span>
      )}
    </button>
  )
}

function CheckboxCard({
  label,
  sublabel,
  checked,
  onChange
}: {
  label: string
  sublabel?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full p-4 rounded-lg text-left transition-all flex items-start gap-3"
      style={{
        backgroundColor: checked ? "#F3EEF7" : "#FFFFFF",
        border: checked ? "1.5px solid #431F5D" : "0.5px solid #E2E4E8"
      }}
    >
      <div
        className="flex-shrink-0 w-4 h-4 rounded mt-0.5 flex items-center justify-center"
        style={{
          backgroundColor: checked ? "#431F5D" : "#FFFFFF",
          border: checked ? "1.5px solid #431F5D" : "1.5px solid #E2E4E8"
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div>
        <span className="font-normal block" style={{ fontSize: "14px", color: "#431F5D" }}>
          {label}
        </span>
        {sublabel && (
          <span className="font-normal block mt-0.5" style={{ fontSize: "12px", color: "#4A4A6A" }}>
            {sublabel}
          </span>
        )}
      </div>
    </button>
  )
}

function DurationInput({
  value,
  unit,
  onValueChange,
  onUnitChange,
  error
}: {
  value: string
  unit: DurationUnit
  onValueChange: (v: string) => void
  onUnitChange: (u: DurationUnit) => void
  error?: string
}) {
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === "" || (/^\d+$/.test(raw) && parseInt(raw) > 0)) {
      onValueChange(raw)
    }
  }

  return (
    <div className="flex gap-3">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleNumberInput}
        placeholder="e.g. 12"
        className="w-28 px-4 py-3 rounded-lg font-normal outline-none transition-all text-center"
        style={{
          backgroundColor: "#F7F8FA",
          border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
          color: "#431F5D",
          fontSize: "14px"
        }}
        onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
        onBlur={(e) => { e.target.style.border = error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8" }}
      />
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value as DurationUnit)}
        className="flex-1 px-4 py-3 rounded-lg font-normal outline-none transition-all"
        style={{
          backgroundColor: "#F7F8FA",
          border: "0.5px solid #E2E4E8",
          color: "#431F5D",
          fontSize: "14px",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A4A6A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px"
        }}
        onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
        onBlur={(e) => { e.target.style.border = "0.5px solid #E2E4E8" }}
      >
        <option value="weeks">Weeks</option>
        <option value="months">Months</option>
        <option value="years">Years</option>
      </select>
    </div>
  )
}

function TextInput({
  label,
  placeholder,
  value,
  onChange,
  error
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div className="space-y-1">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
        style={{
          backgroundColor: "#F7F8FA",
          border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
          color: "#431F5D",
          fontSize: "14px"
        }}
        onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
        onBlur={(e) => { e.target.style.border = error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8" }}
      />
      {error && <FieldError message={error} />}
    </div>
  )
}

function CountryDropdown({
  label,
  value,
  onChange,
  helperText,
  error
}: {
  label: string
  value: { name: string; code: string }
  onChange: (value: { name: string; code: string }) => void
  helperText?: string
  error?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const countries = [
    { name: "Australia", code: "AU" },
    { name: "Austria", code: "AT" },
    { name: "Belgium", code: "BE" },
    { name: "Brazil", code: "BR" },
    { name: "Canada", code: "CA" },
    { name: "China", code: "CN" },
    { name: "Denmark", code: "DK" },
    { name: "Finland", code: "FI" },
    { name: "France", code: "FR" },
    { name: "Germany", code: "DE" },
    { name: "Hong Kong", code: "HK" },
    { name: "India", code: "IN" },
    { name: "Ireland", code: "IE" },
    { name: "Israel", code: "IL" },
    { name: "Italy", code: "IT" },
    { name: "Japan", code: "JP" },
    { name: "Mexico", code: "MX" },
    { name: "Netherlands", code: "NL" },
    { name: "New Zealand", code: "NZ" },
    { name: "Norway", code: "NO" },
    { name: "Poland", code: "PL" },
    { name: "Portugal", code: "PT" },
    { name: "Singapore", code: "SG" },
    { name: "South Korea", code: "KR" },
    { name: "Spain", code: "ES" },
    { name: "Sweden", code: "SE" },
    { name: "Switzerland", code: "CH" },
    { name: "Taiwan", code: "TW" },
    { name: "United Arab Emirates", code: "AE" },
    { name: "United Kingdom", code: "GB" },
    { name: "United States", code: "US" }
  ]

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-1 relative">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="text"
          placeholder="Search countries..."
          value={isOpen ? search : value.name}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
          style={{
            backgroundColor: "#F7F8FA",
            border: error
              ? "1.5px solid #B71C1C"
              : isOpen
                ? "2px solid #FB6A1B"
                : "0.5px solid #E2E4E8",
            color: "#431F5D",
            fontSize: "14px"
          }}
        />
        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-lg shadow-lg z-10"
            style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E4E8" }}
          >
            {filtered.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country)
                  setSearch("")
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left font-normal hover:bg-gray-50 transition-colors"
                style={{ color: "#431F5D", fontSize: "14px" }}
              >
                {country.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-2 font-normal" style={{ color: "#4A4A6A", fontSize: "14px" }}>
                No countries found
              </div>
            )}
          </div>
        )}
      </div>
      {helperText && !error && <FieldHelper>{helperText}</FieldHelper>}
      {error && <FieldError message={error} />}
    </div>
  )
}

function FileUpload({
  file,
  onFileSelect,
  onRemove,
  error
}: {
  file: File | null
  onFileSelect: (file: File) => void
  onRemove: () => void
  error?: string
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const droppedFile = files[0]
      if (droppedFile.size <= 10 * 1024 * 1024) onFileSelect(droppedFile)
    }
  }, [onFileSelect])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const selectedFile = files[0]
      if (selectedFile.size <= 10 * 1024 * 1024) onFileSelect(selectedFile)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  if (file) {
    return (
      <div
        className="p-4 rounded-lg flex items-center justify-between"
        style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E4E8" }}
      >
        <div>
          <p className="font-medium" style={{ color: "#431F5D", fontSize: "14px" }}>{file.name}</p>
          <p className="font-normal" style={{ color: "#4A4A6A", fontSize: "12px" }}>{formatFileSize(file.size)}</p>
        </div>
        <button type="button" onClick={onRemove} className="font-normal" style={{ color: "#D2582F", fontSize: "14px" }}>
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="p-8 rounded-lg cursor-pointer text-center transition-all"
        style={{
          border: isDragging
            ? "1.5px dashed #FB6A1B"
            : error
              ? "1.5px dashed #B71C1C"
              : "1.5px dashed #E2E4E8",
          borderRadius: "8px"
