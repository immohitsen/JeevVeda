"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Loader2 } from "lucide-react"
import axios from "axios"
import { AsciiArtDemo } from "@/components/AsciiArtDemo"

// Palette: dark navy bg · teal accent · slate text — clinical, not hacker
const CATEGORIES = ["feedback", "bug_report", "feature_request", "other"]

interface FormState {
    name: string; email: string; subject: string; message: string; category: string
}

const LABEL = "text-slate-500 whitespace-nowrap text-[11px] tracking-widest uppercase"
const INPUT = "bg-transparent border-none outline-none text-slate-200 font-mono text-sm w-full placeholder:text-slate-700 caret-teal-400"

export default function HelpdeskPage() {
    const [form, setForm] = useState<FormState>({
        name: "", email: "", subject: "", message: "", category: "feedback",
    })
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errorMsg, setErrorMsg] = useState("")

    const set = (k: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setForm(p => ({ ...p, [k]: e.target.value }))
            if (status === "error") setStatus("idle")
        }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim() || !form.message.trim()) return
        setStatus("loading")
        try {
            await axios.post("/api/helpdesk", form)
            setStatus("success")
        } catch (err: unknown) {
            setErrorMsg(axios.isAxiosError(err) && err.response?.data?.error
                ? err.response.data.error : "transmission error — please retry.")
            setStatus("error")
        }
    }

    const reset = () => {
        setStatus("idle")
        setForm({ name: "", email: "", subject: "", message: "", category: "feedback" })
    }

    return (
        // Dark navy — feels like a clinical information system, not a terminal
        <div className="relative overflow-y-auto font-mono min-h-[calc(100dvh-4rem)] lg:min-h-full" style={{ background: "#07101a" }}>

            {/* ── ASCII art — bottom-right, very subtle ───────────────────── */}
            <div className="absolute bottom-0 right-0 opacity-30 pointer-events-none scale-[0.5] origin-bottom-right lg:scale-100">
                <AsciiArtDemo />
            </div>

            {/* ── Thin teal top bar — like a medical app header ───────────── */}
            {/* <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #0d9488, #2dd4bf, transparent)" }} /> */}

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div className="relative z-10 flex flex-col justify-center px-5 sm:px-10 lg:px-16 py-10 max-w-lg">

                {/* System header
                <div className="mb-7 space-y-1 text-[11px]" style={{ color: "#1e4d5c" }}>
                    <p>JEEV VEDA CLINICAL SYSTEMS ·  SUPPORT MODULE  ·  v2.4</p>
                    <p style={{ color: "#0f6b6b" }}>
                        &gt; help_desk.service .................. <span style={{ color: "#2dd4bf" }}>READY</span>
                    </p>
                    <p style={{ color: "#0f6b6b" }}>
                        &gt; awaiting input<span className="animate-pulse">_</span>
                    </p>
                </div> */}

                <h1 className="text-xl font-bold tracking-[0.25em] mb-7" style={{ color: "#2dd4bf" }}>
                    HELP DESK
                </h1>

                <AnimatePresence mode="wait">
                    {status === "success" ? (

                        /* ── Success ── */
                        <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-sm">
                            <p style={{ color: "#0f6b6b" }}>&gt; submitting report...</p>
                            <p style={{ color: "#2dd4bf" }}>&gt; report received  ✓</p>
                            <p className="text-xs mt-3" style={{ color: "#1e4d5c" }}>our team will review your message shortly.</p>
                            <button onClick={reset} className="mt-4 text-xs underline underline-offset-4 transition-colors"
                                style={{ color: "#0f6b6b" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#2dd4bf")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#0f6b6b")}
                            >
                                &gt; submit another
                            </button>
                        </motion.div>

                    ) : (

                        /* ── Form ── */
                        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4 text-sm">

                            {([
                                { label: "NAME", k: "name" as const, type: "text", ph: "full name", req: true },
                                { label: "EMAIL", k: "email" as const, type: "email", ph: "optional", req: false },
                                { label: "SUBJECT", k: "subject" as const, type: "text", ph: "brief description", req: false },
                            ]).map(({ label, k, type, ph, req }) => (
                                <div key={k} className="flex items-center gap-3" style={{ borderBottom: "1px solid #0d2a38" }}>
                                    <span className={LABEL} style={{ color: "#1e5c6b", minWidth: "74px" }}>{label}</span>
                                    <span style={{ color: "#2dd4bf" }}>›</span>
                                    <input type={type} value={form[k]} onChange={set(k)} placeholder={ph} required={req}
                                        className={INPUT} style={{ paddingBlock: "6px" }} />
                                </div>
                            ))}

                            {/* Category */}
                            <div className="flex items-center gap-3" style={{ borderBottom: "1px solid #0d2a38" }}>
                                <span className={LABEL} style={{ color: "#1e5c6b", minWidth: "74px" }}>TYPE</span>
                                <span style={{ color: "#2dd4bf" }}>›</span>
                                <select value={form.category} onChange={set("category")}
                                    className="bg-transparent border-none outline-none font-mono text-sm w-full"
                                    style={{ color: "#94a3b8", paddingBlock: "6px" }}>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c} style={{ background: "#07101a", color: "#94a3b8" }}>
                                            {c.replace("_", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Message */}
                            <div style={{ borderBottom: "1px solid #0d2a38", paddingBottom: "6px" }}>
                                <div className="flex items-start gap-3">
                                    <span className={LABEL} style={{ color: "#1e5c6b", minWidth: "74px", paddingTop: "6px" }}>MESSAGE</span>
                                    <span style={{ color: "#2dd4bf", paddingTop: "6px" }}>›</span>
                                    <textarea value={form.message} onChange={set("message")}
                                        placeholder="describe your query, suggestion, or finding..."
                                        required rows={4}
                                        className={`${INPUT} resize-none mt-[6px]`}
                                    />
                                </div>
                                <div className="text-right text-[10px] mt-1" style={{ color: "#0d2a38" }}>
                                    {form.message.length} / 2000
                                </div>
                            </div>

                            {/* Error */}
                            {status === "error" && (
                                <p className="text-xs" style={{ color: "#f87171" }}>&gt; ERROR: {errorMsg}</p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={status === "loading" || !form.name.trim() || !form.message.trim()}
                                className="mt-2 flex items-center gap-2 font-bold text-xs tracking-widest px-5 py-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ background: "#0d9488", color: "#fff", letterSpacing: "0.2em" }}
                                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "#0f766e" }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#0d9488" }}
                            >
                                {status === "loading"
                                    ? <><Loader2 className="w-3 h-3 animate-spin" /> SUBMITTING REPORT</>
                                    : "SUBMIT REPORT  ›"}
                            </button>

                            <p className="text-[10px]" style={{ color: "#1e3a4e" }}>
                                * required  ·  all submissions are reviewed by the development team
                            </p>

                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
