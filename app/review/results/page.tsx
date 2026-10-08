"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span className="font-medium text-xl" style={{ color: "#FFFFFF" }}>Pact</span>
      <span
        className="inline-block rounded-full ml-0.5"
        style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", width: "6px", height: "6px" }}
      />
    </div>
  )
}

function NavBar({ firstName, lastName, clientName }: { firstName: string; lastName: string; clientName: string }) {
  return (
    <nav className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#431F5D" }}>
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
        {firstName && lastName ? `${firstName} ${lastName}` : "..."} · {clientName || ""}
      </span>
    </nav>
  )
}

interface Deviation {
  id: number
  type: "minor" | "major" | "escalation"
  title: string
  counterparty: string
  standard: string
  reason: string
}

function MinorDeviationRow({
  deviation, clientName,
}: {
  deviation: Deviation
  clientName: string
}) {
  const displayName = clientName || "your company"

  return (
    <div className="rounded-xl mb-3 overflow-hidden"
      style={{ border: "0.5px solid #E2E4E8", backgroundColor: "#FFFFFF" }}>
      <div className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: "0.5px solid #F0F0F0", backgroundColor: "#FFFBF5" }}>
        <span className="font-medium text-sm" style={{ color: "#431F5D" }}>{deviation.title}</span>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full"
          style={{ backgroundColor: "#FAEEDA", color: "#854F0B" }}>
          Minor
        </span>
      </div>
      <div className="grid grid-cols-2" style={{ borderBottom: "0.5px solid #F0F0F0" }}>
        <div className="p-3" style={{ borderRight: "0.5px solid #F0F0F0" }}>
          <p className="text-xs font-medium uppercase mb-1" style={{ color: "#854F0B", letterSpacing: "0.06em" }}>Counterparty</p>
          <p className="text-xs leading-relaxed" style={{ color: "#4A4A6A" }}>{deviation.counterparty || "—"}</p>
        </div>
        <div className="p-3">
          <p className="text-xs font-medium uppercase mb-1" style={{ color: "#431F5D", letterSpacing: "0.06em" }}>{displayName} standard</p>
          <p className="text-xs leading-relaxed" style={{ color: "#431F5D" }}>{deviation.standard || "—"}</p>
        </div>
      </div>
      <div className="px-4 py-3" style={{ borderTop: "0.5px solid #F0F0F0" }}>
        <p className="text-xs leading-relaxed" style={{ color: "#4A4A6A" }}>{deviation.reason}</p>
      </div>
    </div>
  )
}

function FlaggedRow({ deviation }: { deviation: Deviation }) {
  return (
    <div className="rounded-xl mb-3 overflow-hidden"
      style={{
        border: deviation.type === "escalation" ? "0.5px solid #CECBF6" : "0.5px solid #F7C1C1",
        backgroundColor: "#FFFFFF",
      }}>
      <div className="px-4 py-3 flex items-center gap-2"
        style={{
          borderBottom: "0.5px solid #F0F0F0",
          backgroundColor: deviation.type === "escalation" ? "#EEEDFE" : "#FCEBEB",
        }}>
        <span className="font-medium text-sm" style={{ color: "#431F5D" }}>{deviation.title}</span>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full"
          style={{
            backgroundColor: deviation.type === "escalation" ? "#EEEDFE" : "#FCEBEB",
            color: deviation.type === "escalation" ? "#534AB7" : "#A32D2D"
          }}>
          {deviation.type === "escalation" ? "Escalated" : "Major"}
        </span>
        <span className="ml-auto text-xs"
          style={{ color: deviation.type === "escalation" ? "#534AB7" : "#A32D2D" }}>
          {deviation.type === "escalation" ? "Attorney assessment required" : "Flagged to legal"}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs leading-relaxed" style={{ color: "#4A4A6A" }}>{deviation.reason}</p>
        {deviation.counterparty && (
          <p className="text-xs mt-2" style={{ color: "#9B9B9B" }}>
            <span className="font-medium">Counterparty position:</span> {deviation.counterparty}
          </p>
        )}
      </div>
    </div>
  )
}

type PageState = "green" | "amber" | "red"

export default function ResultsPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clientName, setClientName] = useState("")
  const sessionRef = useRef<{
    userId: string; clientId: string; userEmail: string
    firstName: string; lastName: string; clientName: string
  } | null>(null)

  const [deviations, setDeviations] = useState<Deviation[]>([])
  const [mutualOrUnilateral, setMutualOrUnilateral] = useState("")
  const [counterpartyName, setCounterpartyName] = useState("")
  const [submissionId, setSubmissionId] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const notifyFiredRef = useRef(false)

  useEffect(() => {
    async function loadClientData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/"); return }

      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name, client_id")
        .eq("id", session.user.id)
        .single()

      if (!userData) return
      setFirstName(userData.first_name || "")
      setLastName(userData.last_name || "")

      const { data: clientData } = await supabase
        .from("clients")
        .select("display_name")
        .eq("id", userData.client_id)
        .single()

      const resolvedClientName = clientData?.display_name || ""
      if (clientData) setClientName(resolvedClientName)

      sessionRef.current = {
        userId: session.user.id,
        clientId: userData.client_id,
        userEmail: session.user.email || "",
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        clientName: resolvedClientName,
      }
    }
    loadClientData()
  }, [router])

  useEffect(() => {
    const raw = sessionStorage.getItem("review_result")
    const name = sessionStorage.getItem("review_counterparty_name")
    const sid = sessionStorage.getItem("review_submission_id")
    if (!raw) { router.push("/review"); return }

    if (sid) setSubmissionId(sid)

    const data = JSON.parse(raw)
    setMutualOrUnilateral(data.mutual_or_unilateral || "")
    setCounterpartyName(name || "Counterparty")

    const issues: Deviation[] = (data.issues || []).map((item: {
      risk: string; clause: string; issue: string
      counterparty_position?: string; standard_position?: string
    }, index: number) => ({
      id: index + 1,
      type: item.risk === "MAJOR" ? "major" : item.risk === "ESCALATION" ? "escalation" : "minor",
      title: item.clause,
      counterparty: item.counterparty_position || "",
      standard: item.standard_position || "",
      reason: item.issue,
    }))

    setDeviations(issues)
    setLoaded(true)
  }, [router])

  const writeAuditLog = async (deviation: Deviation) => {
    if (!sessionRef.current || !submissionId) return
    const { userId, clientId, userEmail, firstName: fn, lastName: ln, clientName: cn } = sessionRef.current
    await supabase.from("audit_log").insert({
      submission_id: submissionId,
      client_id: clientId,
      user_id: userId,
      user_email: userEmail,
      user_name: `${fn} ${ln}`.trim(),
      client_name: cn,
      clause_type: deviation.title,
      deviation_severity: deviation.type,
      action_taken: "noted",
    })
  }

  const handleDownload = () => {
    const fileData = sessionStorage.getItem("review_file_data")
    const fileName = sessionStorage.getItem("review_file_name")
    if (!fileData || !fileName) return
    minorDeviations.forEach(d => writeAuditLog(d))
    const a = document.createElement("a")
    a.href = fileData
    a.download = fileName
    a.click()
  }

  const minorDeviations = useMemo(() => deviations.filter(d => d.type === "minor"), [deviations])
  const majorDeviations = useMemo(() => deviations.filter(d => d.type === "major"), [deviations])
  const escalations     = useMemo(() => deviations.filter(d => d.type === "escalation"), [deviations])

  const hasMinors     = minorDeviations.length > 0
  const hasMajors     = majorDeviations.length > 0
  const hasEscalation = escalations.length > 0
  const totalClauses  = deviations.length
  const displayName   = clientName || "your company"

  const pageState: PageState =
    hasEscalation ? "red" :
    hasMajors     ? "amber" :
    "green"

  // Auto-notify legal — escalations
  useEffect(() => {
    if (!loaded || !hasEscalation || notifyFiredRef.current) return
    notifyFiredRef.current = true
    const clauseList = escalations.map(d => `- ${d.title}: ${d.counterparty || d.reason}`).join("\n")
    const subject = encodeURIComponent(`NDA Review — Attorney Review Required · ${counterpartyName}`)
    const body = encodeURIComponent(
      `Dear Legal Team,\n\nAn NDA review for ${counterpartyName} has identified the following clause(s) that require attorney review:\n\n${clauseList}\n\nSubmission ID: ${submissionId}\n\nPlease review and provide a finalised version for external distribution.\n\nThank you.`
    )
    window.location.href = `mailto:legal@counselect.com?subject=${subject}&body=${body}`
  }, [loaded, hasEscalation, escalations, counterpartyName, submissionId])

  // Auto-notify legal — major deviations
  useEffect(() => {
    if (!loaded || !hasMajors || hasEscalation || notifyFiredRef.current) return
    notifyFiredRef.current = true
    const clauseList = majorDeviations.map(d => `- ${d.title}: ${d.counterparty || d.reason}`).join("\n")
    const subject = encodeURIComponent(`NDA Review — Major Deviations · ${counterpartyName}`)
    const body = encodeURIComponent(
      `Dear Legal Team,\n\nAn NDA review for ${counterpartyName} has identified the following major deviations from ${clientName}'s standard positions:\n\n${clauseList}\n\nSubmission ID: ${submissionId}\n\nPlease review and advise.\n\nThank you.`
    )
    window.location.href = `mailto:legal@counselect.com?subject=${subject}&body=${body}`
  }, [loaded, hasMajors, hasEscalation, majorDeviations, counterpartyName, submissionId, clientName])

  const heroConfig = {
    green: {
      iconBg: "#EAF3DE", iconColor: "#3B6D11",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      verdict: "Ready to send",
      sub: hasMinors
        ? `This NDA is good to go. There are ${minorDeviations.length} minor difference${minorDeviations.length > 1 ? "s" : ""} from ${displayName}'s standard positions — none of them are a blocker to signing.`
        : `No issues found — this NDA is ready to go to ${counterpartyName}.`,
    },
    amber: {
      iconBg: "#FAEEDA", iconColor: "#854F0B",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      verdict: "Waiting on legal — don't send yet",
      sub: `${majorDeviations.length} clause${majorDeviations.length > 1 ? "s fall" : " falls"} outside ${displayName}'s standard positions. Your Counselect attorney has been notified and will respond within 4 hours.`,
    },
    red: {
      iconBg: "#FCEBEB", iconColor: "#A32D2D",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      verdict: "Do not send — attorney review needed",
      sub: `One or more clauses couldn't be assessed against ${displayName}'s standards. Your Counselect attorney has been notified and will send a finalised version within 4 hours.`,
    },
  }

  const hero = heroConfig[pageState]

  if (!loaded) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
        <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "#4A4A6A", fontSize: "13px" }}>Loading results...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="rounded-xl p-6 mb-4"
          style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E4E8" }}>
          <div className="flex items-start gap-4 mb-5">
            <div className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{ width: 48, height: 48, backgroundColor: hero.iconBg, color: hero.iconColor }}>
              {hero.icon}
            </div>
            <div>
              <h1 className="font-medium mb-1" style={{ fontSize: "20px", color: "#431F5D" }}>
                {hero.verdict}
              </h1>
              <p style={{ fontSize: "14px", color: "#4A4A6A", lineHeight: 1.6 }}>{hero.sub}</p>
              <p className="mt-2" style={{ fontSize: "12px", color: "#9B9B9B" }}>
                {counterpartyName}
                {mutualOrUnilateral ? ` · ${mutualOrUnilateral}` : ""}
                {` · Reviewed against ${displayName}'s NDA standards`}
              </p>
            </div>
          </div>

          {/* Amber notice */}
          {pageState === "amber" && (
            <div className="rounded-lg px-4 py-3 mb-5 flex gap-3"
              style={{ backgroundColor: "#FAEEDA", border: "0.5px solid #FAC775" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize: "13px", color: "#633806", lineHeight: 1.5 }}>
                Your attorney will send the finalised version directly. No action needed from you right now.
              </p>
            </div>
          )}

          {/* Red notice */}
          {pageState === "red" && (
            <div className="rounded-lg px-4 py-3 mb-5 flex gap-3"
              style={{ backgroundColor: "#FCEBEB", border: "0.5px solid #F7C1C1" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              <p style={{ fontSize: "13px", color: "#791F1F", lineHeight: 1.5 }}>
                Do not send this NDA to the counterparty. Your attorney will provide the external-ready version.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            {pageState === "green" && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm"
                style={{ backgroundColor: "#EF7043", color: "#FFFFFF", border: "none" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download NDA
              </button>
            )}
            <Link href="/home"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
              style={{ color: "#4A4A6A", border: "0.5px solid #E2E4E8", backgroundColor: "#F7F8FA" }}>
              Back to home
            </Link>
          </div>
        </div>

        {/* Minor deviations — FYI only, green state */}
        {pageState === "green" && hasMinors && (
          <div className="rounded-xl p-5 mb-4"
            style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E4E8" }}>
            <div className="flex items-start gap-3 mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize: "13px", color: "#854F0B", lineHeight: 1.5 }}>
                For your information — {minorDeviations.length} minor difference{minorDeviations.length > 1 ? "s" : ""} from {displayName}'s standard positions. These are within acceptable range and are not a blocker to signing.
              </p>
            </div>
            {minorDeviations.map(d => (
              <MinorDeviationRow key={d.id} deviation={d} clientName={clientName} />
            ))}
          </div>
        )}

        {/* Collapsible detail — amber / red states */}
        {(pageState === "amber" || pageState === "red") && totalClauses > 0 && (
          <div className="rounded-xl overflow-hidden mb-4"
            style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E4E8" }}>
            <button
              onClick={() => setDetailOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-3 text-left"
              style={{ background: "none", border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: "13px", color: "#4A4A6A" }}>
                See what was reviewed ({totalClauses} clause{totalClauses > 1 ? "s" : ""}
                {hasMajors ? ` — ${majorDeviations.length} flagged` : ""}
                {hasEscalation ? ` — ${escalations.length} escalated` : ""})
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: detailOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {detailOpen && (
              <div className="px-5 pb-4" style={{ borderTop: "0.5px solid #F0F0F0" }}>
                {hasMinors && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase mb-1"
                      style={{ color: "#854F0B", letterSpacing: "0.08em" }}>
                      Minor differences — {minorDeviations.length}
                    </p>
                    <p className="text-xs mb-3" style={{ color: "#9B9B9B" }}>
                      Within acceptable range — not a blocker.
                    </p>
                    {minorDeviations.map(d => (
                      <MinorDeviationRow key={d.id} deviation={d} clientName={clientName} />
                    ))}
                  </div>
                )}
                {hasMajors && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase mb-2"
                      style={{ color: "#A32D2D", letterSpacing: "0.08em" }}>
                      Major deviations — {majorDeviations.length}
                    </p>
                    {majorDeviations.map(d => <FlaggedRow key={d.id} deviation={d} />)}
                  </div>
                )}
                {hasEscalation && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase mb-2"
                      style={{ color: "#534AB7", letterSpacing: "0.08em" }}>
                      Escalated — {escalations.length}
                    </p>
                    {escalations.map(d => <FlaggedRow key={d.id} deviation={d} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center" style={{ fontSize: "12px", color: "#9B9B9B" }}>
          Reviewed against {displayName}'s NDA standards · Pact by Counselect
        </p>

      </div>
    </main>
  )
}
