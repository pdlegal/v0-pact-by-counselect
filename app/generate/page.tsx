"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type EngagementType = "exploring" | "evaluating" | "sharing_data" | "something_else" | ""
type InformationType = "software" | "customer_data" | "employee_data" | "branding" | "financial" | "none"
type DurationUnit = "weeks" | "months" | "years"

interface ClientEntity {
  id: string
  label: string
  entity_name: string
  country: string
  country_code: string
  address: string
  governing_law: string
}

// ─────────────────────────────────────────────
// PURPOSE GENERATION
// ─────────────────────────────────────────────

function generatePurpose(
  engagementType: EngagementType,
  informationTypes: InformationType[],
  counterpartyName: string,
  clientName: string
): string {
  const cp = counterpartyName.trim() || "the counterparty"
  const cn = clientName || "our company"
  const hasSoftware = informationTypes.includes("software")
  const hasCustomerData = informationTypes.includes("customer_data")
  const hasEmployeeData = informationTypes.includes("employee_data")
  const hasFinancial = informationTypes.includes("financial")

  if (engagementType === "exploring") {
    if (hasSoftware) return `Evaluation of proprietary software, technology, and demo environments in connection with a potential business partnership between ${cn} and ${cp}.`
    if (hasFinancial) return `Exploration of a potential business partnership or collaboration between ${cn} and ${cp}, involving the exchange of financial and commercial information.`
    return `Exploration of a potential business partnership or collaboration between ${cn} and ${cp}.`
  }
  if (engagementType === "evaluating") {
    if (hasSoftware) return `Evaluation of software, technology, and services provided by ${cp} for potential procurement by ${cn}.`
    if (hasCustomerData) return `Evaluation of a vendor or service provider (${cp}) for potential engagement, involving the exchange of customer data.`
    return `Evaluation of a vendor, technology, or service offered by ${cp} for potential procurement by ${cn}.`
  }
  if (engagementType === "sharing_data") {
    if (hasCustomerData) return `Exchange of customer and client data between ${cn} and ${cp} in connection with a defined business purpose.`
    if (hasEmployeeData) return `Exchange of employee and HR information between ${cn} and ${cp} in connection with a defined business purpose.`
    if (hasFinancial) return `Exchange of financial and commercial data between ${cn} and ${cp} in connection with a defined business purpose.`
    return `Exchange of confidential data between ${cn} and ${cp} in connection with a defined business purpose.`
  }
  if (engagementType === "something_else") return `General business discussions between ${cn} and ${cp}.`
  return ""
}

// ─────────────────────────────────────────────
// CLAUSE TRIGGER LOGIC
// ─────────────────────────────────────────────

function getTriggeredClauses(informationTypes: InformationType[]) {
  return {
    ipTriggered: informationTypes.includes("software"),
    dataPrivacyTriggered: informationTypes.includes("customer_data") || informationTypes.includes("employee_data")
  }
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span className="text-xl font-medium" style={{ color: "#FFFFFF" }}>Pact</span>
      <span className="inline-block rounded-full ml-0.5" style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", width: "6px", height: "6px" }} />
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

function ProgressIndicator({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100
  return (
    <div className="mb-6">
      <span className="font-normal" style={{ color: "#4A4A6A", fontSize: "12px" }}>Step {step} of {totalSteps}</span>
      <div className="mt-2 w-full h-[3px] rounded-full" style={{ backgroundColor: "#E2E4E8" }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #FB6A1B, #D2582F)" }} />
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-medium uppercase -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 mt-8 mb-6 text-center"
      style={{ fontSize: "11px", color: "#431F5D", letterSpacing: "0.08em", backgroundColor: "#F3EEF7", borderTop: "0.5px solid #E2E4E8", borderBottom: "0.5px solid #E2E4E8" }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block font-medium mb-3" style={{ color: "#431F5D", fontSize: "15px" }}>{children}</label>
}

function FieldHelper({ children }: { children: React.ReactNode }) {
  return <p className="font-normal mt-1.5" style={{ color: "#4A4A6A", fontSize: "12px" }}>{children}</p>
}

function FieldError({ message }: { message: string }) {
  return <span style={{ color: "#B71C1C", fontSize: "12px" }}>{message}</span>
}

function RadioCard({ label, sublabel, selected, onClick, fullWidth = false }: {
  label: string; sublabel?: string; selected: boolean; onClick: () => void; fullWidth?: boolean
}) {
  return (
    <button type="button" onClick={onClick} className={`p-4 rounded-lg text-left transition-all ${fullWidth ? "w-full" : ""}`}
      style={{ backgroundColor: selected ? "#F3EEF7" : "#FFFFFF", border: selected ? "1.5px solid #431F5D" : "0.5px solid #E2E4E8", color: "#431F5D", fontSize: "14px" }}>
      <span className="font-normal block">{label}</span>
      {sublabel && <span className="font-normal block mt-0.5" style={{ fontSize: "12px", color: "#4A4A6A" }}>{sublabel}</span>}
    </button>
  )
}

function CheckboxCard({ label, sublabel, checked, onChange }: {
  label: string; sublabel?: string; checked: boolean; onChange: (checked: boolean) => void
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="w-full p-4 rounded-lg text-left transition-all flex items-start gap-3"
      style={{ backgroundColor: checked ? "#F3EEF7" : "#FFFFFF", border: checked ? "1.5px solid #431F5D" : "0.5px solid #E2E4E8" }}>
      <div className="flex-shrink-0 w-4 h-4 rounded mt-0.5 flex items-center justify-center"
        style={{ backgroundColor: checked ? "#431F5D" : "#FFFFFF", border: checked ? "1.5px solid #431F5D" : "1.5px solid #E2E4E8" }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div>
        <span className="font-normal block" style={{ fontSize: "14px", color: "#431F5D" }}>{label}</span>
        {sublabel && <span className="font-normal block mt-0.5" style={{ fontSize: "12px", color: "#4A4A6A" }}>{sublabel}</span>}
      </div>
    </button>
  )
}

function TextInput({ label, placeholder, value, onChange, helperText, error }: {
  label: string; placeholder?: string; value: string; onChange: (value: string) => void; helperText?: string; error?: string
}) {
  return (
    <div className="space-y-1">
      <FieldLabel>{label}</FieldLabel>
      <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
        style={{ backgroundColor: "#F7F8FA", border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8", color: "#431F5D", fontSize: "14px" }}
        onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
        onBlur={(e) => { e.target.style.border = error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8" }} />
      {helperText && !error && <FieldHelper>{helperText}</FieldHelper>}
      {error && <FieldError message={error} />}
    </div>
  )
}

function CountryDropdown({ label, value, onChange, helperText, error }: {
  label: string; value: { name: string; code: string }; onChange: (value: { name: string; code: string }) => void; helperText?: string; error?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const countries = [
    { name: "Australia", code: "AU" }, { name: "Austria", code: "AT" }, { name: "Belgium", code: "BE" },
    { name: "Brazil", code: "BR" }, { name: "Canada", code: "CA" }, { name: "China", code: "CN" },
    { name: "Denmark", code: "DK" }, { name: "Finland", code: "FI" }, { name: "France", code: "FR" },
    { name: "Germany", code: "DE" }, { name: "Hong Kong", code: "HK" }, { name: "India", code: "IN" },
    { name: "Ireland", code: "IE" }, { name: "Israel", code: "IL" }, { name: "Italy", code: "IT" },
    { name: "Japan", code: "JP" }, { name: "Mexico", code: "MX" }, { name: "Netherlands", code: "NL" },
    { name: "New Zealand", code: "NZ" }, { name: "Norway", code: "NO" }, { name: "Poland", code: "PL" },
    { name: "Portugal", code: "PT" }, { name: "Singapore", code: "SG" }, { name: "South Korea", code: "KR" },
    { name: "Spain", code: "ES" }, { name: "Sweden", code: "SE" }, { name: "Switzerland", code: "CH" },
    { name: "Taiwan", code: "TW" }, { name: "United Arab Emirates", code: "AE" },
    { name: "United Kingdom", code: "GB" }, { name: "United States", code: "US" }
  ]
  const filtered = countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-1 relative">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input type="text" placeholder="Search countries..."
          value={isOpen ? search : value.name}
          onChange={(e) => { setSearch(e.target.value); if (!isOpen) setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
          style={{ backgroundColor: "#F7F8FA", border: error ? "1.5px solid #B71C1C" : isOpen ? "2px solid #FB6A1B" : "0.5px solid #E2E4E8", color: "#431F5D", fontSize: "14px" }} />
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-lg shadow-lg z-10"
            style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E4E8" }}>
            {filtered.map((country) => (
              <button key={country.code} type="button"
                onClick={() => { onChange(country); setSearch(""); setIsOpen(false) }}
                className="w-full px-4 py-2 text-left font-normal hover:bg-gray-50 transition-colors"
                style={{ color: "#431F5D", fontSize: "14px" }}>
                {country.name}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-4 py-2 font-normal" style={{ color: "#4A4A6A", fontSize: "14px" }}>No countries found</div>}
          </div>
        )}
      </div>
      {helperText && !error && <FieldHelper>{helperText}</FieldHelper>}
      {error && <FieldError message={error} />}
    </div>
  )
}

function DurationInput({ value, unit, onValueChange, onUnitChange, error }: {
  value: string; unit: DurationUnit; onValueChange: (v: string) => void; onUnitChange: (u: DurationUnit) => void; error?: string
}) {
  return (
    <div className="flex gap-3">
      <input type="text" inputMode="numeric" value={value} placeholder="e.g. 12"
        onChange={(e) => { const raw = e.target.value; if (raw === "" || (/^\d+$/.test(raw) && parseInt(raw) > 0)) onValueChange(raw) }}
        className="w-28 px-4 py-3 rounded-lg font-normal outline-none transition-all text-center"
        style={{ backgroundColor: "#F7F8FA", border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8", color: "#431F5D", fontSize: "14px" }}
        onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
        onBlur={(e) => { e.target.style.border = error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8" }} />
      <select value={unit} onChange={(e) => onUnitChange(e.target.value as DurationUnit)}
        className="flex-1 px-4 py-3 rounded-lg font-normal outline-none transition-all"
        style={{ backgroundColor: "#F7F8FA", border: "0.5px solid #E2E4E8", color: "#431F5D", fontSize: "14px", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A4A6A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "36px" }}
        onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
        onBlur={(e) => { e.target.style.border = "0.5px solid #E2E4E8" }}>
        <option value="weeks">Weeks</option>
        <option value="months">Months</option>
        <option value="years">Years</option>
      </select>
    </div>
  )
}

function PurposeBlock({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="space-y-1">
      <FieldLabel>Purpose of engagement</FieldLabel>
      <FieldHelper>Auto-generated from your selections. Click to edit if needed.</FieldHelper>
      {editing ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)} autoFocus
          className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all resize-none"
          style={{ backgroundColor: "#F7F8FA", border: "2px solid #FB6A1B", color: "#431F5D", fontSize: "14px" }} />
      ) : (
        <button type="button" onClick={() => setEditing(true)}
          className="w-full px-4 py-3 rounded-lg text-left transition-all"
          style={{ backgroundColor: value ? "#F3EEF7" : "#F7F8FA", border: error ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
            color: value ? "#431F5D" : "#9B9B9B", fontSize: "14px", lineHeight: "1.5", minHeight: "80px" }}>
          {value || "Purpose will appear here once you select an engagement type above."}
        </button>
      )}
      {error && <FieldError message={error} />}
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function GeneratePage() {
  const router = useRouter()

  // Client data from Supabase
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientId, setClientId] = useState("")
  const [entities, setEntities] = useState<ClientEntity[]>([])
  const [loadingClient, setLoadingClient] = useState(true)

  // Form state
  const [partyType, setPartyType] = useState("")
  const [sharingDirection, setSharingDirection] = useState("")
  const [engagementType, setEngagementType] = useState<EngagementType>("")
  const [informationTypes, setInformationTypes] = useState<InformationType[]>([])
  const [durationValue, setDurationValue] = useState("")
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("months")
  const [counterpartyName, setCounterpartyName] = useState("")
  const [counterpartyCountry, setCounterpartyCountry] = useState<{ name: string; code: string }>({ name: "", code: "" })
  const [selectedEntity, setSelectedEntity] = useState<ClientEntity | null>(null)
  const [entityAddress, setEntityAddress] = useState("")
  const [purpose, setPurpose] = useState("")
  const [signatoryName, setSignatoryName] = useState("")
  const [signatoryTitle, setSignatoryTitle] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load client data on mount
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
      setClientId(userData.client_id)

      const { data: clientData } = await supabase
        .from("clients")
        .select("display_name")
        .eq("id", userData.client_id)
        .single()

      if (clientData) setClientName(clientData.display_name || "")

      const { data: entityData } = await supabase
        .from("client_entities")
        .select("id, label, entity_name, country, country_code, address, governing_law")
        .eq("client_id", userData.client_id)
        .eq("active", true)
        .order("entity_name")

      if (entityData) setEntities(entityData)
      setLoadingClient(false)
    }

    loadClientData()
  }, [])

  // Auto-generate purpose
  useEffect(() => {
    if (!engagementType) return
    if (engagementType !== "something_else" && informationTypes.length === 0) return
    setPurpose(generatePurpose(engagementType, informationTypes, counterpartyName, clientName))
  }, [engagementType, informationTypes, counterpartyName, clientName])

  const handleEntitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const entity = entities.find(en => en.entity_name === e.target.value) || null
    setSelectedEntity(entity)
    setEntityAddress(entity ? entity.address : "")
    clearError("selectedEntity")
  }

  const showInformationTypes = ["exploring", "evaluating", "sharing_data"].includes(engagementType)
  const showEscalationBanner = engagementType === "something_else"
  const { ipTriggered, dataPrivacyTriggered } = getTriggeredClauses(informationTypes)

  const toggleInformationType = (type: InformationType) => {
    setInformationTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
    if (errors.informationTypes) setErrors(prev => ({ ...prev, informationTypes: "" }))
  }

  const handleEngagementTypeChange = (type: EngagementType) => {
    setEngagementType(type)
    setInformationTypes([])
    if (errors.engagementType) setErrors(prev => ({ ...prev, engagementType: "" }))
  }

  const clearError = (key: string) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!partyType) newErrors.partyType = "Please select who you are sharing information with"
    if (!sharingDirection) newErrors.sharingDirection = "Please select the sharing direction"
    if (!engagementType) newErrors.engagementType = "Please describe this engagement"
    if (showInformationTypes && informationTypes.length === 0) newErrors.informationTypes = "Please select at least one information type"
    if (!durationValue) newErrors.duration = "Please enter the agreement term"
    if (!counterpartyName.trim()) newErrors.counterpartyName = "Please enter the counterparty name"
    if (!counterpartyCountry.code) newErrors.counterpartyCountry = "Please select a country"
    if (!selectedEntity) newErrors.selectedEntity = "Please select your entity"
    if (!entityAddress.trim()) newErrors.entityAddress = "Please enter your registered address"
    if (!purpose.trim()) newErrors.purpose = "Please enter the purpose of this engagement"
    if (!signatoryName.trim()) newErrors.signatoryName = "Please enter the signatory name"
    if (!signatoryTitle.trim()) newErrors.signatoryTitle = "Please enter the signatory title"
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      sessionStorage.setItem("generateFormData", JSON.stringify({
        counterparty_name: counterpartyName,
        counterparty_address: counterpartyCountry.name,
        effective_date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
        engagement_type: engagementType,
        purpose,
        technia_entity: selectedEntity!.entity_name,
        technia_entity_address: entityAddress,
        technia_entity_country: selectedEntity!.country,
        country: counterpartyCountry.code,
        client_id: clientId,
        party_type: partyType,
        sharing_direction: sharingDirection,
        duration: `${durationValue} ${durationUnit}`,
        information_types: informationTypes,
        signatory_name: signatoryName,
        signatory_title: signatoryTitle,
        governing_law: selectedEntity!.governing_law,
      }))
      router.push("/generate/processing")
    }
  }

  const partyTypes = ["Customer", "Supplier or vendor", "Partner", "Other"]
  const sharingOptions = ["Both sides will share", "Only we will share", "Only they will share"]
  const engagementOptions: { value: EngagementType; label: string; sublabel: string }[] = [
    { value: "exploring", label: "Exploring a potential partnership or collaboration", sublabel: "Early stage conversations, scoping an engagement" },
    { value: "evaluating", label: "Evaluating a vendor, technology, or service", sublabel: "Assessing a product, platform, or supplier" },
    { value: "sharing_data", label: "Sharing specific confidential data", sublabel: "Transferring data as part of a defined purpose" },
    { value: "something_else", label: "Something else — I'm not sure", sublabel: "A Counselect attorney will review before finalisation" }
  ]
  const informationOptions: { value: InformationType; label: string; sublabel: string }[] = [
    { value: "software", label: "Software, platform access, or demos", sublabel: "Code, SaaS access, proprietary technology, demo environments" },
    { value: "customer_data", label: "Customer or client information", sublabel: "Personal data about customers or end users" },
    { value: "employee_data", label: "Employee or HR information", sublabel: "Staff personal data, payroll, HR records" },
    { value: "financial", label: "Financial or commercial data", sublabel: "Revenue figures, pricing, forecasts, commercial terms" },
    { value: "branding", label: "Branding or marketing materials", sublabel: "Logos, campaign assets, brand guidelines" },
    { value: "none", label: "None of the above", sublabel: "General business information only" }
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />
      <div className="px-4 py-8">
        <form onSubmit={handleSubmit} className="mx-auto w-full"
          style={{ maxWidth: "580px", backgroundColor: "#FFFFFF", border: "0.5px solid #E2E4E8", borderRadius: "10px", overflow: "hidden" }}>

          <div className="px-6 sm:px-8 pt-6 sm:pt-8">
            <ProgressIndicator step={1} totalSteps={2} />
            <h1 className="font-medium mb-2" style={{ fontSize: "16px", color: "#431F5D" }}>{"Let's build your NDA"}</h1>
            <p className="font-normal" style={{ fontSize: "13px", color: "#4A4A6A" }}>
              Answer a few questions and we'll draft it to {clientName || "your company"}'s standard.
            </p>
          </div>

          <SectionLabel>About the agreement</SectionLabel>
          <div className="px-6 sm:px-8 space-y-8">

            <div className="space-y-3">
              <FieldLabel>Who are you sharing information with?</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {partyTypes.map((type) => (
                  <RadioCard key={type} label={type} selected={partyType === type}
                    onClick={() => { setPartyType(type); clearError("partyType") }} />
                ))}
              </div>
              {errors.partyType && <FieldError message={errors.partyType} />}
            </div>

            <div className="space-y-3">
              <FieldLabel>Will both sides be sharing confidential information?</FieldLabel>
              <div className="flex flex-col gap-3">
                {sharingOptions.map((option) => (
                  <RadioCard key={option} label={option} selected={sharingDirection === option}
                    onClick={() => { setSharingDirection(option); clearError("sharingDirection") }} fullWidth />
                ))}
              </div>
              {errors.sharingDirection && <FieldError message={errors.sharingDirection} />}
            </div>

            <div className="space-y-3">
              <FieldLabel>What best describes this engagement?</FieldLabel>
              <div className="flex flex-col gap-3">
                {engagementOptions.map((option) => (
                  <RadioCard key={option.value} label={option.label} sublabel={option.sublabel}
                    selected={engagementType === option.value}
                    onClick={() => handleEngagementTypeChange(option.value)} fullWidth />
                ))}
              </div>
              {errors.engagementType && <FieldError message={errors.engagementType} />}
            </div>

            {showEscalationBanner && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#FFF3E0", border: "1px solid #FFE0B2" }}>
                <p style={{ fontSize: "13px", color: "#E65100", lineHeight: 1.5 }}>
                  Your {clientName || "company"} attorney will review this submission before finalisation.
                </p>
              </div>
            )}

            {showInformationTypes && (
              <div className="space-y-3">
                <div>
                  <FieldLabel>What type of information will you be sharing?</FieldLabel>
                  <FieldHelper>Select all that apply.</FieldHelper>
                </div>
                <div className="flex flex-col gap-3">
                  {informationOptions.map((option) => (
                    <CheckboxCard key={option.value} label={option.label} sublabel={option.sublabel}
                      checked={informationTypes.includes(option.value)}
                      onChange={() => toggleInformationType(option.value)} />
                  ))}
                </div>
                {errors.informationTypes && <FieldError message={errors.informationTypes} />}
                {(ipTriggered || dataPrivacyTriggered) && (
                  <div className="p-3 rounded-lg space-y-1" style={{ backgroundColor: "#F3EEF7", border: "1px solid #D1C4E9" }}>
                    <p className="font-medium" style={{ fontSize: "12px", color: "#431F5D" }}>Additional clauses will be included:</p>
                    {ipTriggered && <p style={{ fontSize: "12px", color: "#4A4A6A" }}>· IP licensing clause — access is for evaluation only, ownership stays with the disclosing party</p>}
                    {dataPrivacyTriggered && <p style={{ fontSize: "12px", color: "#4A4A6A" }}>· Data privacy clause — both parties acknowledge applicable privacy laws and processing limitations</p>}
                  </div>
                )}
              </div>
            )}

            {engagementType && (
              <PurposeBlock value={purpose} onChange={(v) => { setPurpose(v); clearError("purpose") }} error={errors.purpose} />
            )}

            <div className="space-y-3">
              <FieldLabel>How long is the agreement term?</FieldLabel>
              <DurationInput value={durationValue} unit={durationUnit}
                onValueChange={(v) => { setDurationValue(v); clearError("duration") }}
                onUnitChange={setDurationUnit} error={errors.duration} />
              <FieldHelper>
                {durationValue ? `Agreement term: ${durationValue} ${durationUnit}` : "Enter a number and select weeks, months, or years."}
              </FieldHelper>
              {errors.duration && <FieldError message={errors.duration} />}
            </div>

          </div>

          <SectionLabel>About the counterparty</SectionLabel>
          <div className="px-6 sm:px-8 space-y-6">
            <TextInput label="Name of the other company" placeholder="e.g. Acme Corp"
              value={counterpartyName} onChange={(val) => { setCounterpartyName(val); clearError("counterpartyName") }}
              error={errors.counterpartyName} />
            <CountryDropdown label="Which country is the counterparty based in?"
              value={counterpartyCountry} onChange={(val) => { setCounterpartyCountry(val); clearError("counterpartyCountry") }}
              helperText="Used to assess jurisdiction risk. Governing law is set by your playbook."
              error={errors.counterpartyCountry} />
          </div>

          <SectionLabel>About your company</SectionLabel>
          <div className="px-6 sm:px-8 space-y-6">

            <p className="font-normal -mt-2" style={{ fontSize: "12px", color: "#4A4A6A" }}>
              Select the {clientName || "company"} entity signing this NDA. The registered address will auto-populate and can be edited if needed.
            </p>

            <div className="space-y-1">
              <FieldLabel>{clientName || "Company"} entity</FieldLabel>
              {loadingClient ? (
                <div className="w-full px-4 py-3 rounded-lg font-normal"
                  style={{ backgroundColor: "#F7F8FA", border: "0.5px solid #E2E4E8", color: "#9B9B9B", fontSize: "14px" }}>
                  Loading entities...
                </div>
              ) : (
                <select value={selectedEntity?.entity_name || ""} onChange={handleEntitySelect}
                  className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
                  style={{ backgroundColor: "#F7F8FA", border: errors.selectedEntity ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8",
                    color: selectedEntity ? "#431F5D" : "#9B9B9B", fontSize: "14px", appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A4A6A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "36px" }}
                  onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
                  onBlur={(e) => { e.target.style.border = errors.selectedEntity ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8" }}>
                  <option value="">Select entity...</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.entity_name}>{entity.label}</option>
                  ))}
                </select>
              )}
              {errors.selectedEntity && <FieldError message={errors.selectedEntity} />}
            </div>

            {selectedEntity && (
              <div className="space-y-1">
                <FieldLabel>Registered address</FieldLabel>
                <textarea rows={3} value={entityAddress}
                  onChange={(e) => { setEntityAddress(e.target.value); clearError("entityAddress") }}
                  className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all resize-none"
                  style={{ backgroundColor: "#F7F8FA", border: errors.entityAddress ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8", color: "#431F5D", fontSize: "14px" }}
                  onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
                  onBlur={(e) => { e.target.style.border = errors.entityAddress ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8" }} />
                {errors.entityAddress && <FieldError message={errors.entityAddress} />}
              </div>
            )}

            <div className="space-y-1">
              <FieldLabel>Name and title of the person signing</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <input type="text" placeholder="Full name" value={signatoryName}
                    onChange={(e) => { setSignatoryName(e.target.value); clearError("signatoryName") }}
                    className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
                    style={{ backgroundColor: "#F7F8FA", border: errors.signatoryName ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8", color: "#431F5D", fontSize: "14px" }}
                    onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
                    onBlur={(e) => { e.target.style.border = errors.signatoryName ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8" }} />
                  {errors.signatoryName && <FieldError message={errors.signatoryName} />}
                </div>
                <div className="space-y-1">
                  <input type="text" placeholder="e.g. Head of Sales" value={signatoryTitle}
                    onChange={(e) => { setSignatoryTitle(e.target.value); clearError("signatoryTitle") }}
                    className="w-full px-4 py-3 rounded-lg font-normal outline-none transition-all"
                    style={{ backgroundColor: "#F7F8FA", border: errors.signatoryTitle ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8", color: "#431F5D", fontSize: "14px" }}
                    onFocus={(e) => { e.target.style.border = "2px solid #FB6A1B" }}
                    onBlur={(e) => { e.target.style.border = errors.signatoryTitle ? "1.5px solid #B71C1C" : "0.5px solid #E2E4E8" }} />
                  {errors.signatoryTitle && <FieldError message={errors.signatoryTitle} />}
                </div>
              </div>
            </div>

            <div className="pb-6 sm:pb-8 pt-2">
              <button type="submit"
                className="w-full py-3 font-medium rounded-md transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", color: "#FFFFFF", fontSize: "14px", borderRadius: "6px" }}>
                Generate my NDA
              </button>
            </div>

          </div>
        </form>
      </div>
    </main>
  )
}
