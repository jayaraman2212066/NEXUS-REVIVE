"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReviewSection } from "@/components";
import {
  Zap, Upload, Search, Wrench, Bot, Eye, Package,
  ShieldCheck, BarChart3, Sparkles, ArrowRight,
  FileText, FileSpreadsheet, FileImage, Mail,
  Database, Archive, ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Search className="w-6 h-6" />,
    color: "#00D4FF",
    title: "Magic Format Detection",
    desc: "150+ format signatures read from raw magic bytes — never relies on file extension alone.",
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    color: "#00FF88",
    title: "Corruption Repair Engine",
    desc: "Block-level recovery of truncated, header-damaged, and stream-corrupted files.",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    color: "#8B5CF6",
    title: "100% Local Edge AI",
    desc: "OCR, classification, and repair run entirely on-device. Zero data sent anywhere.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    color: "#00D4FF",
    title: "Instant Preview",
    desc: "Always free plain-text preview — see recovered content before committing.",
  },
  {
    icon: <Package className="w-6 h-6" />,
    color: "#FFD700",
    title: "Batch Conversion",
    desc: "Drop entire folders and convert up to 50 files simultaneously. Pro feature.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "#00FF88",
    title: "Auto-Delete in 24h",
    desc: "Files permanently erased after 24 hours — zero long-term storage footprint.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: "#FF6B35",
    title: "File Health Report",
    desc: "Visual corruption score + repairability rating before you start conversion.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    color: "#8B5CF6",
    title: "95%+ Format Fidelity",
    desc: "Tables, headings, images, and styles preserved in .docx, .pdf, and .xlsx output.",
  },
];

const FORMAT_GROUPS = [
  {
    icon: <FileText className="w-5 h-5" />,
    color: "#00D4FF",
    label: "Word Processing",
    formats: ["WordPerfect .wpd", "Word 97 .doc", ".docx", ".rtf", ".odt"],
  },
  {
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: "#00FF88",
    label: "Spreadsheets",
    formats: ["Excel 97 .xls", ".xlsx", ".ods", ".csv", "Lotus 1-2-3", "dBASE .dbf"],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    color: "#FF6B35",
    label: "PDFs",
    formats: ["Normal PDF", "Scanned (OCR)", "Corrupted PDF", "Password-free"],
  },
  {
    icon: <Mail className="w-5 h-5" />,
    color: "#8B5CF6",
    label: "Email",
    formats: [".eml", ".msg", ".mbox", "RFC-822"],
  },
  {
    icon: <FileImage className="w-5 h-5" />,
    color: "#FFD700",
    label: "Images (OCR)",
    formats: [".png", ".jpg", ".tiff", ".bmp", ".gif"],
  },
  {
    icon: <Archive className="w-5 h-5" />,
    color: "#00D4FF",
    label: "Archives",
    formats: [".zip", ".gz", ".tar", "GZIP streams"],
  },
];

const STATS = [
  { value: "50+", label: "Formats Supported", color: "#00D4FF" },
  { value: "0",   label: "Files Ever Lost",   color: "#00FF88" },
  { value: "<30s", label: "Avg Restore Time", color: "#8B5CF6" },
  { value: "100%", label: "Local Processing", color: "#00D4FF" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#040B14] text-[#E0EFFF] overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#040B14]/85 border-b border-[#00D4FF]/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Nexus Revive" width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-[#00D4FF]">NEXUS REVIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#features" className="text-[#7096B8] hover:text-[#E0EFFF] transition">Features</Link>
            <Link href="#formats" className="text-[#7096B8] hover:text-[#E0EFFF] transition">Formats</Link>
            <Link href="#reviews" className="text-[#7096B8] hover:text-[#E0EFFF] transition">Reviews</Link>
            <Link href="/pricing" className="text-[#7096B8] hover:text-[#E0EFFF] transition">Pricing</Link>
          </div>
          <Link
            href="/convert"
            className="flex items-center gap-2 px-5 py-2 bg-[#00D4FF] text-[#040B14] text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.45)] transition"
          >
            <Zap className="w-4 h-4" /> Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#00D4FF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#8B5CF6]/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-full text-xs font-medium text-[#00D4FF] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
              100% free to preview · No sign-up needed
            </motion.div>

            <motion.h1 {...fadeUp(0.08)} className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Resurrect Any File.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6]">
                From Any Era.
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.16)} className="text-lg text-[#7096B8] leading-relaxed mb-8 max-w-xl">
              Corrupted Word docs. Ancient spreadsheets. Scanned PDFs nobody can open.
              Our AI repairs, extracts, and converts them — in seconds, on your device.
            </motion.p>

            <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/convert"
                className="flex items-center gap-2 px-7 py-3.5 bg-[#00D4FF] text-[#040B14] font-bold rounded-xl hover:shadow-[0_0_32px_rgba(0,212,255,0.5)] transition text-base"
              >
                <Zap className="w-5 h-5" /> Revive Your File — Free
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-7 py-3.5 border border-[#00D4FF]/30 text-[#E0EFFF] font-semibold rounded-xl hover:bg-[#00D4FF]/8 transition text-base"
              >
                See Pricing <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div {...fadeUp(0.32)} className="flex flex-wrap gap-5 text-xs text-[#3A5570]">
              {["No account required", "Files auto-deleted in 24h", "Zero cloud upload"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — logo + drop zone */}
          <motion.div {...fadeUp(0.2)} className="flex flex-col items-center gap-6">
            {/* Logo card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00D4FF]/20 to-[#8B5CF6]/20 blur-2xl scale-110" />
              <div className="relative bg-[#0A1628]/80 backdrop-blur border border-[#00D4FF]/20 rounded-3xl p-8 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Nexus Revive"
                  width={220}
                  height={220}
                  className="rounded-2xl drop-shadow-[0_0_40px_rgba(0,212,255,0.3)]"
                  priority
                />
              </div>
            </div>

            {/* Mini drop CTA */}
            <Link
              href="/convert"
              className="w-full max-w-sm bg-[#0A1628]/60 backdrop-blur border-2 border-dashed border-[#00D4FF]/30 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-[#00D4FF] hover:bg-[#00D4FF]/5 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center group-hover:bg-[#00D4FF]/20 transition">
                <Upload className="w-6 h-6 text-[#00D4FF]" />
              </div>
              <p className="text-[#E0EFFF] font-semibold text-sm">Drop your file here to start</p>
              <p className="text-[#3A5570] text-xs text-center">
                .wpd · .doc · .xls · .pdf · .rtf · .eml · .dbf + 50 more
              </p>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-[#00D4FF]/8 bg-[#0A1628]/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i * 0.08)}>
              <div className="text-4xl font-extrabold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-sm text-[#7096B8]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#E0EFFF] mb-4">
              Everything a Data Recoverer Does —
              <span className="text-[#00D4FF]"> Automated</span>
            </h2>
            <p className="text-[#7096B8] max-w-2xl mx-auto">
              Professional forensic-grade file recovery techniques, packaged into one drag-and-drop tool.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp(i * 0.06)}
                className="group bg-[#0A1628]/50 backdrop-blur border border-[#00D4FF]/8 rounded-2xl p-6 hover:border-[#00D4FF]/30 hover:bg-[#0A1628]/80 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}18`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-[#E0EFFF] mb-2 leading-snug">{f.title}</h3>
                <p className="text-sm text-[#7096B8] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0A1628]/40">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 {...fadeUp(0)} className="text-3xl font-bold text-[#E0EFFF] mb-14">
            Three Steps to Revive Any File
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: <Upload className="w-7 h-7" />, color: "#00D4FF", title: "Drop Your File", desc: "Any format, any age. We read the raw bytes — not the extension." },
              { step: "02", icon: <Wrench className="w-7 h-7" />, color: "#00FF88", title: "AI Repairs & Extracts", desc: "Corruption repair, encoding fix, OCR on images — fully automated." },
              { step: "03", icon: <Zap className="w-7 h-7" />, color: "#8B5CF6", title: "Preview & Download", desc: "Free preview always. Download .txt, .html, .md free — .docx/.pdf/.xlsx with Pro." },
            ].map((s, i) => (
              <motion.div key={s.step} {...fadeUp(i * 0.1)} className="relative bg-[#112040]/60 backdrop-blur border border-[#00D4FF]/10 rounded-2xl p-7">
                <div className="text-[#00D4FF]/20 text-6xl font-black absolute top-4 right-5 select-none">{s.step}</div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${s.color}18`, color: s.color }}>
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold text-[#E0EFFF] mb-2">{s.title}</h3>
                <p className="text-sm text-[#7096B8] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORTED FORMATS ───────────────────────────────────── */}
      <section id="formats" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#E0EFFF] mb-3">Supported Formats</h2>
            <p className="text-[#7096B8]">Every format has real processing — no stub conversions.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FORMAT_GROUPS.map((g, i) => (
              <motion.div key={g.label} {...fadeUp(i * 0.07)}
                className="bg-[#0A1628]/50 border border-[#00D4FF]/8 rounded-2xl p-6 hover:border-[#00D4FF]/20 transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${g.color}18`, color: g.color }}>
                    {g.icon}
                  </div>
                  <span className="font-bold text-[#E0EFFF]">{g.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.formats.map((fmt) => (
                    <span key={fmt} className="px-2.5 py-1 bg-[#112040] border border-[#00D4FF]/10 rounded-lg text-xs text-[#7096B8] font-mono">
                      {fmt}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ─────────────────────────────────────────────── */}
      <ReviewSection />

      {/* ── CTA BANNER ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <motion.div {...fadeUp(0)} className="max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-br from-[#0A1628] to-[#112040] border border-[#00D4FF]/20 rounded-3xl p-12 text-center">
          <div className="absolute inset-0 bg-[#00D4FF]/3 rounded-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#00D4FF]/10 blur-3xl" />
          <div className="relative">
            <Image src="/logo.png" alt="Nexus Revive" width={64} height={64} className="rounded-xl mx-auto mb-6 drop-shadow-[0_0_20px_rgba(0,212,255,0.4)]" />
            <h2 className="text-4xl font-extrabold text-[#E0EFFF] mb-4">
              Can&apos;t open that file?
            </h2>
            <p className="text-[#7096B8] mb-8 text-lg">
              Drop it in. Free preview, always. No sign-up. No install. No waiting.
            </p>
            <Link
              href="/convert"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#00D4FF] text-[#040B14] font-extrabold rounded-xl text-lg hover:shadow-[0_0_40px_rgba(0,212,255,0.55)] transition"
            >
              <Zap className="w-6 h-6" /> Start Reviving — It&apos;s Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-[#00D4FF]/8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Nexus Revive" width={28} height={28} className="rounded-md opacity-80" />
            <span className="text-[#00D4FF] font-bold">NEXUS REVIVE</span>
          </div>
          <div className="flex gap-6 text-sm text-[#3A5570]">
            <Link href="/convert" className="hover:text-[#7096B8] transition">Convert</Link>
            <Link href="/pricing" className="hover:text-[#7096B8] transition">Pricing</Link>
            <Link href="#features" className="hover:text-[#7096B8] transition">Features</Link>
          </div>
          <p className="text-[#3A5570] text-xs text-center">
            &copy; 2025 Nexus Revive. Built for everyone who&apos;s ever said &ldquo;I can&apos;t open this file.&rdquo;
          </p>
        </div>
      </footer>
    </main>
  );
}
