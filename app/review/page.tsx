"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span 
        className="text-xl font-medium"
        style={{ color: "#FFFFFF" }}
      >
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
      <Link href="/home">
        <PactWordmark />
      </Link>
      <span 
        className="text-xs font-normal"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        Prajoy · <Link href="/" className="hover:underline">Log out</Link>
      </span>
    </nav>
  )
}

function ProgressIndicator({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100
  
  return (
    <div className="mb-6">
      <span 
        className="font-normal"
        style={{ color: "#4A4A6A", fontSize: "12px" }}
      >
        Step {step} of {totalSteps}
      </span>
      <div 
        className="mt-2 w-full h-[3px] rounded-full"
        style={{ backgroundColor: "#E2E4E8" }}
      >
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

function RadioCard({ 
  label, 
  selected, 
  onClick,
  fullWidth = false
}: { 
  label: string
  selected: boolean
  onClick: () => void
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-lg text-left font-normal transition-all ${fullWidth ? 'w-full' : ''}`}
      style={{
        backgroundColor: selected ? "#F3EEF7" : "#FFFFFF",
        border: selected ? "1.5px solid #431F5D" : "0.5px solid #E2E4E8",
        color: "#431F5D",
        fontSize: "14px"
      }}
    >
      {label}
    </button>
  )
}

function TextInput({
  label,
  placeholder,
  value,
  onChange,
  helperText,
  maxLength,
  error
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  maxLength?: number
  error?: string
}) {
  return (
    <div className="space-y-2">
      <label 
        className="block font-normal"
        style={{ color: "#431F5D", fontSize: "14px" }}
      >
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
        style={{
          backgroundColor: "#F7F8FA",
          border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
          color: "#431F5D",
          fontSize: "14px"
        }}
        onFocus={(e) => {
          e.target.style.border = "2px solid #FB6A1B"
        }}
        onBlur={(e) => {
          e.target.style.border = error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8"
        }}
      />
      <div className="flex justify-between items-center">
        {helperText && (
          <span style={{ color: error ? "#B71C1C" : "#4A4A6A", fontSize: "12px" }}>
            {error || helperText}
          </span>
        )}
        {maxLength && (
          <span style={{ color: "#4A4A6A", fontSize: "12px" }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
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
  value: string
  onChange: (value: string) => void
  helperText?: string
  error?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  
  const countries = [
    "Australia", "Austria", "Belgium", "Brazil", "Canada", "China", 
    "Denmark", "Finland", "France", "Germany", "Hong Kong", "India", 
    "Ireland", "Israel", "Italy", "Japan", "Mexico", "Netherlands", 
    "New Zealand", "Norway", "Poland", "Portugal", "Singapore", 
    "South Korea", "Spain", "Sweden", "Switzerland", "Taiwan",
    "United Arab Emirates", "United Kingdom", "United States"
  ]
  
  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-2 relative">
      <label 
        className="block font-normal"
        style={{ color: "#431F5D", fontSize: "14px" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search countries..."
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
          style={{
            backgroundColor: "#F7F8FA",
            border: error ? "1.5px solid #B71C1C" : isOpen ? "2px solid #FB6A1B" : "0.5px solid #E2E4E8",
            color: "#431F5D",
            fontSize: "14px"
          }}
        />
        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-lg shadow-lg z-10"
            style={{ 
              backgroundColor: "#FFFFFF",
              border: "0.5px solid #E2E4E8"
            }}
          >
            {filteredCountries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => {
                  onChange(country)
                  setSearch("")
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left font-normal hover:bg-gray-50 transition-colors"
                style={{ color: "#431F5D", fontSize: "14px" }}
              >
                {country}
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div 
                className="px-4 py-2 font-normal"
                style={{ color: "#4A4A6A", fontSize: "14px" }}
              >
                No countries found
              </div>
            )}
          </div>
        )}
      </div>
      {helperText && (
        <span style={{ color: error ? "#B71C1C" : "#4A4A6A", fontSize: "12px" }}>
          {error || helperText}
        </span>
      )}
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
      if (droppedFile.size <= 10 * 1024 * 1024) {
        onFileSelect(droppedFile)
      }
    }
  }, [onFileSelect])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const selectedFile = files[0]
      if (selectedFile.size <= 10 * 1024 * 1024) {
        onFileSelect(selectedFile)
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (file) {
    return (
      <div 
        className="p-4 rounded-lg flex items-center justify-between"
        style={{ 
          backgroundColor: "#FFFFFF",
          border: "0.5px solid #E2E4E8"
        }}
      >
        <div>
          <p className="font-medium" style={{ color: "#431F5D", fontSize: "14px" }}>
            {file.name}
          </p>
          <p className="font-normal" style={{ color: "#4A4A6A", fontSize: "12px" }}>
            {formatFileSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="font-normal"
          style={{ color: "#D2582F", fontSize: "14px" }}
        >
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
        }}
      >
        <p className="font-medium mb-1" style={{ color: "#431F5D", fontSize: "13px" }}>
          Drop their NDA here, or click to browse
        </p>
        <p className="font-normal" style={{ color: "#4A4A6A", fontSize: "12px" }}>
          .docx or .pdf · max 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".docx,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && (
        <span style={{ color: "#B71C1C", fontSize: "12px" }}>
          {error}
        </span>
      )}
    </div>
  )
}

export default function ReviewIntakePage() {
  const router = useRouter()
  const [partyType, setPartyType] = useState<string>("")
  const [sharingDirection, setSharingDirection] = useState<string>("")
  const [purpose, setPurpose] = useState("")
  const [country, setCountry] = useState("")
  const [duration, setDuration] = useState<string>("")
  const [companyName, setCompanyName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const partyTypes = ["Customer", "Supplier or vendor", "Partner", "Other"]
  const sharingOptions = [
    "Both sides will share",
    "Only we will share", 
    "Only they will share"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!partyType) newErrors.partyType = "Please select who you are sharing information with"
    if (!sharingDirection) newErrors.sharingDirection = "Please select the sharing direction"
    if (!purpose.trim()) newErrors.purpose = "Please describe what this NDA is for"
    if (!country) newErrors.country = "Please select a country"
    if (!duration) newErrors.duration = "Please select a duration"
    if (!companyName.trim()) newErrors.companyName = "Please enter the company name"
    if (!file) newErrors.file = "Please upload the NDA document"
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      // Form is valid, navigate to processing page
      router.push("/review/processing")
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      
      <div className="flex-1 flex justify-center px-4 py-8">
        <form 
          onSubmit={handleSubmit}
          className="w-full"
          style={{ maxWidth: "580px" }}
        >
          <div 
            className="p-6 sm:p-8 rounded-lg"
            style={{ 
              backgroundColor: "#FFFFFF",
              border: "0.5px solid #E2E4E8",
              borderRadius: "10px"
            }}
          >
            <ProgressIndicator step={1} totalSteps={2} />
            
            <h1 
              className="font-medium mb-2"
              style={{ color: "#431F5D", fontSize: "16px" }}
            >
              Tell us about this NDA
            </h1>
            <p 
              className="font-normal mb-8"
              style={{ color: "#4A4A6A", fontSize: "13px" }}
            >
              A few quick questions so we can apply the right positions.
            </p>

            <div className="space-y-8">
              {/* Field 1: Party Type */}
              <div className="space-y-3">
                <label 
                  className="block font-normal"
                  style={{ color: "#431F5D", fontSize: "14px" }}
                >
                  Who are you sharing information with?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {partyTypes.map((type) => (
                    <RadioCard
                      key={type}
                      label={type}
                      selected={partyType === type}
                      onClick={() => setPartyType(type)}
                    />
                  ))}
                </div>
                {errors.partyType && (
                  <span style={{ color: "#B71C1C", fontSize: "12px" }}>
                    {errors.partyType}
                  </span>
                )}
              </div>

              {/* Field 2: Sharing Direction */}
              <div className="space-y-3">
                <label 
                  className="block font-normal"
                  style={{ color: "#431F5D", fontSize: "14px" }}
                >
                  Will both sides be sharing confidential information?
                </label>
                <div className="flex flex-col gap-3">
                  {sharingOptions.map((option) => (
                    <RadioCard
                      key={option}
                      label={option}
                      selected={sharingDirection === option}
                      onClick={() => setSharingDirection(option)}
                      fullWidth
                    />
                  ))}
                </div>
                {errors.sharingDirection && (
                  <span style={{ color: "#B71C1C", fontSize: "12px" }}>
                    {errors.sharingDirection}
                  </span>
                )}
              </div>

              {/* Field 3: Purpose */}
              <TextInput
                label="What is this NDA for?"
                placeholder="e.g. evaluating a potential software vendor"
                value={purpose}
                onChange={setPurpose}
                helperText="A brief description — this shapes the purpose clause."
                maxLength={150}
                error={errors.purpose}
              />

              {/* Field 4: Country */}
              <CountryDropdown
                label="What country is the other party based in?"
                value={country}
                onChange={setCountry}
                helperText="Used to apply the right governing law."
                error={errors.country}
              />

              {/* Field 5: Duration */}
              <TextInput
                label="How long is the agreement term?"
                placeholder="e.g. 2 years, 18 months, 5 years"
                value={duration}
                onChange={setDuration}
                helperText="Enter the specific duration for this NDA."
                error={errors.duration}
              />

              {/* Field 6: Company Name */}
              <TextInput
                label="Name of the other company"
                placeholder="Enter company name"
                value={companyName}
                onChange={setCompanyName}
                error={errors.companyName}
              />

              {/* File Upload */}
              <FileUpload
                file={file}
                onFileSelect={setFile}
                onRemove={() => setFile(null)}
                error={errors.file}
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-md font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
                  fontSize: "14px",
                  borderRadius: "6px"
                }}
              >
                Review this NDA
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
