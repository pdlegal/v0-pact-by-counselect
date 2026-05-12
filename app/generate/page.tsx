"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function PactWordmark() {
  return (
    <div className="flex items-center gap-1">
      <span 
        className="text-xl font-medium"
        style={{ color: "#FFFFFF" }}
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
      <Link href="/home">
        <PactWordmark />
      </Link>
      <span 
        className="font-normal"
        style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px" }}
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
        className="font-normal mb-2 block"
        style={{ fontSize: "12px", color: "#4A4A6A" }}
      >
        Step {step} of {totalSteps}
      </span>
      <div 
        className="w-full h-[3px] rounded-full"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="font-normal uppercase mt-8 mb-4"
      style={{ 
        fontSize: "11px", 
        color: "#4A4A6A",
        letterSpacing: "0.08em"
      }}
    >
      {children}
    </div>
  )
}

function FieldLabel({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <label 
      className="font-medium block mb-2"
      style={{ fontSize: "14px", color: error ? "#B71C1C" : "#431F5D" }}
    >
      {children}
    </label>
  )
}

function FieldHelper({ children }: { children: React.ReactNode }) {
  return (
    <p 
      className="font-normal mt-1.5"
      style={{ fontSize: "12px", color: "#4A4A6A" }}
    >
      {children}
    </p>
  )
}

function RadioCard({ 
  selected, 
  onClick, 
  children,
  fullWidth = false
}: { 
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-normal text-left p-4 rounded-lg transition-all ${fullWidth ? 'w-full' : ''}`}
      style={{
        border: selected ? "1.5px solid #431F5D" : "0.5px solid #E2E4E8",
        backgroundColor: selected ? "#F3EEF7" : "#FFFFFF",
        color: "#431F5D",
        fontSize: "14px"
      }}
    >
      {children}
    </button>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  error
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  error?: boolean
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2.5 rounded-lg font-normal transition-all outline-none"
        style={{
          fontSize: "14px",
          backgroundColor: "#F7F8FA",
          border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
          color: "#431F5D"
        }}
        onFocus={(e) => {
          e.target.style.border = "2px solid #FB6A1B"
        }}
        onBlur={(e) => {
          e.target.style.border = error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8"
        }}
      />
      {maxLength && (
        <span 
          className="absolute right-3 top-1/2 -translate-y-1/2 font-normal"
          style={{ fontSize: "11px", color: "#9B9B9B" }}
        >
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  )
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  error
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  error?: boolean
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 rounded-lg font-normal transition-all outline-none resize-none"
      style={{
        fontSize: "14px",
        backgroundColor: "#F7F8FA",
        border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
        color: "#431F5D"
      }}
      onFocus={(e) => {
        e.target.style.border = "2px solid #FB6A1B"
      }}
      onBlur={(e) => {
        e.target.style.border = error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8"
      }}
    />
  )
}

function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder,
  error
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  error?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  )
  
  return (
    <div className="relative">
      <input
        type="text"
        value={value || search}
        onChange={(e) => {
          setSearch(e.target.value)
          onChange("")
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg font-normal transition-all outline-none"
        style={{
          fontSize: "14px",
          backgroundColor: "#F7F8FA",
          border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
          color: "#431F5D"
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      <svg 
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#4A4A6A" 
        strokeWidth="2"
      >
        <path d="M6 9l6 6 6-6"/>
      </svg>
      
      {isOpen && filteredOptions.length > 0 && (
        <div 
          className="absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-lg shadow-lg"
          style={{ 
            backgroundColor: "#FFFFFF",
            border: "0.5px solid #E2E4E8"
          }}
        >
          {filteredOptions.slice(0, 10).map((option) => (
            <button
              key={option}
              type="button"
              className="w-full px-3 py-2 text-left font-normal hover:bg-gray-50 transition-colors"
              style={{ fontSize: "14px", color: "#431F5D" }}
              onClick={() => {
                onChange(option)
                setSearch("")
                setIsOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", 
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
  "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
]

export default function GeneratePage() {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  
  // Field 1 - Party type
  const [partyType, setPartyType] = useState("")
  
  // Field 2 - Sharing direction
  const [sharingDirection, setSharingDirection] = useState("")
  
  // Field 3 - Purpose
  const [purpose, setPurpose] = useState("")
  
  // Field 4 - Other party country
  const [otherPartyCountry, setOtherPartyCountry] = useState("")
  
  // Field 5 - Duration
  const [duration, setDuration] = useState("")
  
  // Field 6 - Other company name
  const [otherCompanyName, setOtherCompanyName] = useState("")
  
  // Field 7 - Other company country
  const [otherCompanyCountry, setOtherCompanyCountry] = useState("")
  
  // Field 8 - Your company name
  const [yourCompanyName, setYourCompanyName] = useState("")
  
  // Field 9 - Your company address
  const [yourCompanyAddress, setYourCompanyAddress] = useState("")
  
  // Field 10 - Signatory
  const [signatoryName, setSignatoryName] = useState("")
  const [signatoryTitle, setSignatoryTitle] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, boolean> = {}
    
    if (!partyType) newErrors.partyType = true
    if (!sharingDirection) newErrors.sharingDirection = true
    if (!purpose) newErrors.purpose = true
    if (!otherPartyCountry) newErrors.otherPartyCountry = true
    if (!duration) newErrors.duration = true
    if (!otherCompanyName) newErrors.otherCompanyName = true
    if (!otherCompanyCountry) newErrors.otherCompanyCountry = true
    if (!yourCompanyName) newErrors.yourCompanyName = true
    if (!yourCompanyAddress) newErrors.yourCompanyAddress = true
    if (!signatoryName) newErrors.signatoryName = true
    if (!signatoryTitle) newErrors.signatoryTitle = true
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      // Form is valid, navigate to processing page
      router.push("/generate/processing")
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      
      <div className="px-4 py-8">
        <form 
          onSubmit={handleSubmit}
          className="mx-auto w-full p-6 sm:p-8"
          style={{ 
            maxWidth: "580px",
            backgroundColor: "#FFFFFF",
            border: "0.5px solid #E2E4E8",
            borderRadius: "10px"
          }}
        >
          <ProgressIndicator step={1} totalSteps={2} />
          
          <h1 
            className="font-medium mb-2"
            style={{ fontSize: "16px", color: "#431F5D" }}
          >
            {"Let's build your NDA"}
          </h1>
          <p 
            className="font-normal mb-6"
            style={{ fontSize: "13px", color: "#4A4A6A" }}
          >
            {"Answer a few questions and we'll draft it to TECHNIA's standard."}
          </p>

          {/* SECTION: About the agreement */}
          <SectionLabel>About the agreement</SectionLabel>

          {/* Field 1 - Party type */}
          <div className="mb-6">
            <FieldLabel error={errors.partyType}>Who are you sharing information with?</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {["Customer", "Supplier or vendor", "Partner", "Other"].map((option) => (
                <RadioCard
                  key={option}
                  selected={partyType === option}
                  onClick={() => {
                    setPartyType(option)
                    setErrors(prev => ({ ...prev, partyType: false }))
                  }}
                >
                  {option}
                </RadioCard>
              ))}
            </div>
            {errors.partyType && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please select an option
              </p>
            )}
          </div>

          {/* Field 2 - Sharing direction */}
          <div className="mb-6">
            <FieldLabel error={errors.sharingDirection}>Will both sides be sharing confidential information?</FieldLabel>
            <div className="flex flex-col gap-3">
              {["Both sides will share", "Only we will share", "Only they will share"].map((option) => (
                <RadioCard
                  key={option}
                  selected={sharingDirection === option}
                  onClick={() => {
                    setSharingDirection(option)
                    setErrors(prev => ({ ...prev, sharingDirection: false }))
                  }}
                  fullWidth
                >
                  {option}
                </RadioCard>
              ))}
            </div>
            {errors.sharingDirection && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please select an option
              </p>
            )}
          </div>

          {/* Field 3 - Purpose */}
          <div className="mb-6">
            <FieldLabel error={errors.purpose}>What is this NDA for?</FieldLabel>
            <TextInput
              value={purpose}
              onChange={(val) => {
                setPurpose(val)
                setErrors(prev => ({ ...prev, purpose: false }))
              }}
              placeholder="e.g. onboarding a new software vendor"
              maxLength={150}
              error={errors.purpose}
            />
            <FieldHelper>A brief description — this shapes the purpose clause.</FieldHelper>
            {errors.purpose && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please enter a purpose
              </p>
            )}
          </div>

          {/* Field 4 - Other party country */}
          <div className="mb-6">
            <FieldLabel error={errors.otherPartyCountry}>What country is the other party based in?</FieldLabel>
            <SearchableDropdown
              value={otherPartyCountry}
              onChange={(val) => {
                setOtherPartyCountry(val)
                setErrors(prev => ({ ...prev, otherPartyCountry: false }))
              }}
              options={COUNTRIES}
              placeholder="Search for a country..."
              error={errors.otherPartyCountry}
            />
            <FieldHelper>Used to apply the right governing law.</FieldHelper>
            {errors.otherPartyCountry && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please select a country
              </p>
            )}
          </div>

          {/* Field 5 - Duration */}
          <div className="mb-6">
            <FieldLabel error={errors.duration}>How long do you expect to be working together?</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {["Less than 3 months", "3–6 months", "6–12 months", "1–2 years", "More than 2 years"].map((option) => (
                <RadioCard
                  key={option}
                  selected={duration === option}
                  onClick={() => {
                    setDuration(option)
                    setErrors(prev => ({ ...prev, duration: false }))
                  }}
                >
                  {option}
                </RadioCard>
              ))}
            </div>
            {errors.duration && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please select a duration
              </p>
            )}
          </div>

          {/* SECTION: About the other party */}
          <SectionLabel>About the other party</SectionLabel>

          {/* Field 6 - Other company name */}
          <div className="mb-6">
            <FieldLabel error={errors.otherCompanyName}>Name of the other company</FieldLabel>
            <TextInput
              value={otherCompanyName}
              onChange={(val) => {
                setOtherCompanyName(val)
                setErrors(prev => ({ ...prev, otherCompanyName: false }))
              }}
              error={errors.otherCompanyName}
            />
            {errors.otherCompanyName && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please enter the company name
              </p>
            )}
          </div>

          {/* Field 7 - Other company country */}
          <div className="mb-6">
            <FieldLabel error={errors.otherCompanyCountry}>Their registered country</FieldLabel>
            <SearchableDropdown
              value={otherCompanyCountry}
              onChange={(val) => {
                setOtherCompanyCountry(val)
                setErrors(prev => ({ ...prev, otherCompanyCountry: false }))
              }}
              options={COUNTRIES}
              placeholder="Search for a country..."
              error={errors.otherCompanyCountry}
            />
            <FieldHelper>Where they are legally incorporated.</FieldHelper>
            {errors.otherCompanyCountry && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please select a country
              </p>
            )}
          </div>

          {/* SECTION: About your company */}
          <SectionLabel>About your company</SectionLabel>

          {/* Field 8 - Your company name */}
          <div className="mb-6">
            <FieldLabel error={errors.yourCompanyName}>{"Your company's full legal name"}</FieldLabel>
            <TextInput
              value={yourCompanyName}
              onChange={(val) => {
                setYourCompanyName(val)
                setErrors(prev => ({ ...prev, yourCompanyName: false }))
              }}
              placeholder="e.g. TECHNIA AB"
              error={errors.yourCompanyName}
            />
            {errors.yourCompanyName && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please enter your company name
              </p>
            )}
          </div>

          {/* Field 9 - Your company address */}
          <div className="mb-6">
            <FieldLabel error={errors.yourCompanyAddress}>{"Your company's registered address"}</FieldLabel>
            <TextArea
              value={yourCompanyAddress}
              onChange={(val) => {
                setYourCompanyAddress(val)
                setErrors(prev => ({ ...prev, yourCompanyAddress: false }))
              }}
              placeholder="Street, City, Country"
              rows={3}
              error={errors.yourCompanyAddress}
            />
            {errors.yourCompanyAddress && (
              <p className="mt-2 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                Please enter your company address
              </p>
            )}
          </div>

          {/* SECTION: Signatory */}
          <SectionLabel>Signatory</SectionLabel>

          {/* Field 10 - Signatory name and title */}
          <div className="mb-8">
            <FieldLabel error={errors.signatoryName || errors.signatoryTitle}>Name and title of the person signing</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <TextInput
                  value={signatoryName}
                  onChange={(val) => {
                    setSignatoryName(val)
                    setErrors(prev => ({ ...prev, signatoryName: false }))
                  }}
                  placeholder="Full name"
                  error={errors.signatoryName}
                />
                {errors.signatoryName && (
                  <p className="mt-1 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                    Required
                  </p>
                )}
              </div>
              <div>
                <TextInput
                  value={signatoryTitle}
                  onChange={(val) => {
                    setSignatoryTitle(val)
                    setErrors(prev => ({ ...prev, signatoryTitle: false }))
                  }}
                  placeholder="e.g. Head of Sales"
                  error={errors.signatoryTitle}
                />
                {errors.signatoryTitle && (
                  <p className="mt-1 font-normal" style={{ fontSize: "12px", color: "#B71C1C" }}>
                    Required
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 font-medium rounded-md transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
              color: "#FFFFFF",
              fontSize: "14px",
              borderRadius: "6px"
            }}
          >
            Generate my NDA
          </button>
        </form>
      </div>
    </main>
  )
}
