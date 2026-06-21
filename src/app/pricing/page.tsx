"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, X, Zap, Key, LogOut, Crown } from "lucide-react";
import { LicenseModal } from "@/components/LicenseModal";

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  isPro: boolean;
}

export default function PricingPage() {
  const checkoutUrl = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [showLicense, setShowLicense] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const handleActivated = (activatedUser: { email: string; name?: string; isPro: boolean }) => {
    setUser({ id: "", ...activatedUser });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#040B14] to-[#0A1628]">
      <LicenseModal
        open={showLicense}
        onClose={() => setShowLicense(false)}
        onSuccess={handleActivated}
      />

      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-[#040B14]/80 border-b border-[#00D4FF]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#00D4FF]">NEXUS REVIVE</Link>
          <div className="flex items-center gap-4">
            {!loadingUser && user && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#7096B8]">{user.email}</span>
                {user.isPro && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-full text-xs font-bold text-[#00D4FF]">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                )}
                <button onClick={handleLogout} className="text-[#3A5570] hover:text-[#7096B8] transition" title="Log out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            <Link href="/" className="text-[#E0EFFF] hover:text-[#00D4FF] transition text-sm">← Back to Home</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-[#E0EFFF] mb-4 text-center">Simple, Transparent Pricing</h1>
          <p className="text-xl text-[#7096B8] mb-6 text-center">Start free, upgrade when you need downloads</p>

          {/* License key activation banner */}
          <div className="max-w-xl mx-auto mb-12 p-4 bg-[#112040]/60 border border-[#00D4FF]/20 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-[#E0EFFF] text-sm font-semibold">Already purchased?</p>
              <p className="text-[#7096B8] text-xs mt-0.5">Enter your license key from your Polar purchase email to activate Pro instantly.</p>
            </div>
            <button
              onClick={() => setShowLicense(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition text-sm"
            >
              <Key className="w-4 h-4" /> Activate Key
            </button>
          </div>

          {/* Pro activated state */}
          {user?.isPro && (
            <div className="max-w-xl mx-auto mb-8 p-4 bg-[#00FF88]/5 border border-[#00FF88]/30 rounded-xl flex items-center gap-3">
              <Crown className="w-6 h-6 text-[#00FF88] flex-shrink-0" />
              <div>
                <p className="text-[#00FF88] font-bold text-sm">You&apos;re on Pro!</p>
                <p className="text-[#7096B8] text-xs">All Pro features are active on your account ({user.email}).</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free tier */}
            <div className="bg-[#0A1628]/60 backdrop-blur border border-[#00D4FF]/20 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-[#E0EFFF] mb-2">Free</h2>
              <div className="text-4xl font-bold text-[#00D4FF] mb-6">$0</div>
              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited uploads",
                  "50+ formats detected",
                  "AI corruption repair",
                  "Full plain-text preview",
                  "File health report",
                  "25MB max file size",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span className="text-[#E0EFFF]">{f}</span>
                  </li>
                ))}
                {["Download modern formats", "Batch conversion"].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
                    <span className="text-[#7096B8]">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/convert"
                className="block w-full px-6 py-3 border border-[#00D4FF] text-[#00D4FF] font-bold text-center rounded-lg hover:bg-[#00D4FF]/10 transition"
              >
                Start for Free
              </Link>
            </div>

            {/* Pro tier */}
            <div className="bg-[#0A1628]/60 backdrop-blur border-2 border-[#00D4FF] rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00D4FF] text-[#040B14] text-sm font-bold rounded-full">
                POPULAR
              </div>
              <h2 className="text-3xl font-bold text-[#E0EFFF] mb-2">Pro</h2>
              <div className="text-4xl font-bold text-[#00D4FF] mb-6">
                $4.99<span className="text-xl text-[#7096B8]">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Everything in Free",
                  "Download .docx, .pdf, .xlsx",
                  "Original formatting preserved",
                  "Batch convert 50 files",
                  "Embedded image extraction",
                  "500MB max file size",
                  "7-day shareable preview links",
                  "Priority processing queue",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span className="text-[#E0EFFF]">{f}</span>
                  </li>
                ))}
              </ul>

              {user?.isPro ? (
                <div className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] font-bold text-center rounded-lg">
                  <Crown className="w-5 h-5" /> Pro Active
                </div>
              ) : (
                <div className="space-y-3">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition"
                  >
                    <Zap className="w-5 h-5" /> Upgrade to Pro — $4.99/mo
                  </a>
                  <button
                    onClick={() => setShowLicense(true)}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-[#00D4FF]/30 text-[#7096B8] font-medium rounded-lg hover:bg-[#00D4FF]/5 hover:text-[#00D4FF] transition text-sm"
                  >
                    <Key className="w-4 h-4" /> I have a license key
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* How license keys work */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <h3 className="text-lg font-bold text-[#E0EFFF] mb-3">How it works</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                { step: "1", text: "Purchase Pro on Polar — you\'ll receive a license key by email" },
                { step: "2", text: "Click Activate Key, enter your key and create your account" },
                { step: "3", text: "Pro features unlock instantly — download .docx, .pdf, .xlsx" },
              ].map((s) => (
                <div key={s.step} className="bg-[#0A1628]/50 border border-[#00D4FF]/10 rounded-xl p-4">
                  <div className="text-2xl font-black text-[#00D4FF]/30 mb-2">{s.step}</div>
                  <p className="text-[#7096B8] text-xs leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
