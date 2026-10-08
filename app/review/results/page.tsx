"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

function PactWordmark() {
  return (
    <div className="flex items-center gap-1">
      <span className="font-medium text-xl" style={{ color: "#FFFFFF" }}>Pact</span>
      <span className="inline-block rounded-full"
        style={{ background: "#EF7043", width: "6px", height: "6px", marginBottom: "4px" }} />
    </div>
  )
}

function NavBar({ firstName, lastName, clientName }: { firstName: string; lastName: string; clientName: string }) {
  return (
    <nav className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#431F5D" }}>
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
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
  const displayName   = clientName || "your company"
  const mutualShort   = mutualOrUnilateral?.toLowerCase().includes("mutual") ? "Mutual" :
                        mutualOrUnilateral?.toLowerCase().includes("unilateral") ? "Unilateral" :
                        mutualOrUnilateral

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

        {/* Single card */}
        <div className="rounded-xl overflow-hidden mb-4"
          style={{
            backgroundColor: "#FFFFFF",
            border: pageState === "green"
              ? "0.5px solid #E2E4E8"
              : pageState === "amber"
              ? "0.5px solid #FAC775"
              : "0.5px solid #F7C1C1"
          }}>

          {/* Hero */}
          <div className="flex items-start gap-4 p-5">
            <div className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 38, height: 38,
                backgroundColor: pageState === "green" ? "#EAF3DE" : pageState === "amber" ? "#FAEEDA" : "#FCEBEB",
                color: pageState === "green" ? "#3B6D11" : pageState === "amber" ? "#854F0B" : "#A32D2D",
              }}>
              {pageState === "green" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              )}
              {pageState === "amber" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              )}
              {pageState === "red" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
            </div>
            <div>
              <h1 className="font-medium mb-1" style={{ fontSize: "18px", color: "#431F5D" }}>
                {pageState === "green" && "Ready to send"}
                {pageState === "amber" && "Waiting on legal — don't send yet"}
                {pageState === "red" && "Do not send — attorney review needed"}
              </h1>
              <p style={{ fontSize: "13px", color: "#4A4A6A", lineHeight: 1.6 }}>
                {pageState === "green" && hasMinors &&
                  `${minorDeviations.length} minor difference${minorDeviations.length > 1 ? "s" : ""} from ${displayName}'s standard positions — none are a blocker to signing.`}
                {pageState === "green" && !hasMinors &&
                  `No issues found — this NDA is ready to go to ${counterpartyName}.`}
                {pageState === "amber" &&
                  `${majorDeviations.length} clause${majorDeviations.length > 1 ? "s fall" : " falls"} outside ${displayName}'s standard positions. Your Counselect attorney has been notified and will respond within 4 hours.`}
                {pageState === "red" &&
                  `One or more clauses couldn't be assessed against ${displayName}'s standards. Your Counselect attorney has been notified and will send a finalised version within 4 hours.`}
              </p>
              <p style={{ fontSize: "11px", color: "#9B9B9B", marginTop: "5px" }}>
                {counterpartyName}
                {mutualShort ? ` · ${mutualShort}` : ""}
                {` · Reviewed against ${displayName}'s NDA standards`}
              </p>
            </div>
          </div>

          {/* Score row */}
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ borderTop: "0.5px solid #F0F0F0", borderBottom: "0.5px solid #F0F0F0" }}>
            <span style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#C8C8C8" }}>
              Overall
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
            {pageState === "green" && (
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ backgroundColor: "#EAF3DE", color: "#3B6D11", fontSize: "11px", fontWeight: 500 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                All within acceptable range
              </div>
            )}
            {pageState === "amber" && (
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ backgroundColor: "#FAEEDA", color: "#854F0B", fontSize: "11px", fontWeight: 500 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Pending legal review
              </div>
            )}
            {pageState === "red" && (
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ backgroundColor: "#FCEBEB", color: "#A32D2D", fontSize: "11px", fontWeight: 500 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Attorney review required
              </div>
            )}
          </div>

          {/* Amber / red notice */}
          {(pageState === "amber" || pageState === "red") && (
            <div className="mx-5 my-4 rounded-lg flex gap-3 px-4 py-3"
              style={{
                backgroundColor: pageState === "amber" ? "#FFFBF5" : "#FEF2F2",
                border: `0.5px solid ${pageState === "amber" ? "#FAC775" : "#F7C1C1"}`,
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke={pageState === "amber" ? "#854F0B" : "#A32D2D"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize: "12px", color: pageState === "amber" ? "#633806" : "#791F1F", lineHeight: 1.5 }}>
                {pageState === "amber"
                  ? "Your attorney will send the finalised version directly. No action needed from you right now."
                  : "Do not send this NDA to the counterparty. Your attorney will provide the external-ready version."}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 px-5 pb-5"
            style={{ paddingTop: pageState === "green" ? "14px" : "0" }}>
            {pageState === "green" && (
              <button onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg font-medium text-sm"
                style={{ padding: "8px 18px", backgroundColor: "#EF7043", color: "#FFFFFF", border: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download NDA
              </button>
            )}
            <Link href="/home"
              className="inline-flex items-center rounded-lg text-sm"
              style={{ padding: "8px 16px", color: "#4A4A6A", border: "0.5px solid #E2E4E8", backgroundColor: "#F7F8FA" }}>
              Back to home
            </Link>
          </div>

          {/* Minor differences section */}
          {pageState === "green" && hasMinors && (
            <>
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: "0.5px solid #F0F0F0" }}>
                <span style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9B9B9B" }}>
                  Minor differences — for your information
                </span>
                <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: "#FAEEDA", color: "#854F0B", fontSize: "10px", fontWeight: 500 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {minorDeviations.length} item{minorDeviations.length > 1 ? "s" : ""}
                </div>
              </div>
              <div className="px-5 pb-5">
                {minorDeviations.map((d, i) => (
                  <div key={d.id} className="flex items-start gap-3"
                    style={{
                      paddingTop: "10px", paddingBottom: "10px",
                      borderBottom: i < minorDeviations.length - 1 ? "0.5px solid #F5F5F5" : "none",
                    }}>
                    <div style={{ width: 7, height: 7, minWidth: 7, borderRadius: "50%", backgroundColor: "#FAC775", marginTop: 5 }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#431F5D", minWidth: 150, flexShrink: 0 }}>
                      {d.title}
                    </span>
                    <span style={{ fontSize: "13px", color: "#4A4A6A", flex: 1, lineHeight: 1.45 }}>
                      {d.reason}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Flagged clauses section — amber / red */}
          {(pageState === "amber" || pageState === "red") && (majorDeviations.length > 0 || escalations.length > 0) && (
            <>
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: "0.5px solid #F0F0F0" }}>
                <span style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9B9B9B" }}>
                  Flagged clauses
                </span>
                <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: "#FCEBEB", color: "#A32D2D", fontSize: "10px", fontWeight: 500 }}>
                  {majorDeviations.length + escalations.length} {pageState === "red" ? "escalated" : "major"}
                </div>
              </div>
              <div className="px-5 pb-5">
                {[...majorDeviations, ...escalations].map((d, i) => (
                  <div key={d.id} className="flex items-start gap-3"
                    style={{
                      paddingTop: "10px", paddingBottom: "10px",
                      borderBottom: i < majorDeviations.length + escalations.length - 1 ? "0.5px solid #F5F5F5" : "none",
                    }}>
                    <div style={{ width: 7, height: 7, minWidth: 7, borderRadius: "50%", backgroundColor: "#F09595", marginTop: 5 }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#431F5D", minWidth: 150, flexShrink: 0 }}>
                      {d.title}
                    </span>
                    <span style={{ fontSize: "13px", color: "#4A4A6A", flex: 1, lineHeight: 1.45 }}>
                      {d.reason}
                    </span>
                    <span className="rounded-full flex-shrink-0"
                      style={{
                        fontSize: "10px", fontWeight: 500, padding: "2px 8px",
                        backgroundColor: d.type === "escalation" ? "#EEEDFE" : "#FCEBEB",
                        color: d.type === "escalation" ? "#534AB7" : "#A32D2D",
                        alignSelf: "center", marginLeft: 8,
                      }}>
                      {d.type === "escalation" ? "Escalated" : "Major"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Minor differences also shown inside amber/red — collapsed note */}
              {hasMinors && (
                <div className="flex items-center gap-2 px-5 pb-4"
                  style={{ borderTop: "0.5px solid #F0F0F0", paddingTop: "12px" }}>
                  <div style={{ width: 7, height: 7, minWidth: 7, borderRadius: "50%", backgroundColor: "#FAC775" }} />
                  <span style={{ fontSize: "12px", color: "#9B9B9B" }}>
                    {minorDeviations.length} minor difference{minorDeviations.length > 1 ? "s" : ""} also noted — within acceptable range.
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center" style={{ fontSize: "11px", color: "#C8C8C8" }}>
          Reviewed against {displayName}'s NDA standards · Pact by Counselect
        </p>

      </div>
    </main>
  )
}
