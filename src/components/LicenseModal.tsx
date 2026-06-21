"use client";

import { useState } from "react";
import { X, Key, Loader2, CheckCircle, Eye, EyeOff, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LicenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name?: string; isPro: boolean }) => void;
}

type Step = "key" | "account" | "done";

export function LicenseModal({ open, onClose, onSuccess }: LicenseModalProps) {
  const [step, setStep] = useState<Step>("key");
  const [licenseKey, setLicenseKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleKeySubmit = () => {
    const key = licenseKey.trim().toUpperCase();
    if (key.length < 8) { setError("Please enter a valid license key"); return; }
    setError("");
    setLicenseKey(key);
    setStep("account");
  };

  const handleActivate = async () => {
    if (!email.trim()) { setError("Email is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey, email: email.trim(), password, name: name.trim() }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Activation failed"); return; }

      setStep("done");
      setTimeout(() => {
        onSuccess(data.user);
        onClose();
      }, 1800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("key");
    setLicenseKey("");
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B14]/85 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0A1628] border border-[#00D4FF]/25 rounded-2xl p-8 max-w-md w-full shadow-[0_0_80px_rgba(0,212,255,0.12)] relative"
            initial={{ scale: 0.93, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-[#3A5570] hover:text-[#7096B8] transition">
              <X className="w-4 h-4" />
            </button>

            {/* Step: done */}
            {step === "done" && (
              <div className="text-center py-4">
                <CheckCircle className="w-14 h-14 text-[#00FF88] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#E0EFFF] mb-2">Pro Activated!</h3>
                <p className="text-[#7096B8] text-sm">Your account has been upgraded. All Pro features are now unlocked.</p>
              </div>
            )}

            {/* Step: enter license key */}
            {step === "key" && (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center mx-auto mb-4">
                    <Key className="w-7 h-7 text-[#00D4FF]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#E0EFFF]">Activate Pro License</h2>
                <p className="text-[#7096B8] text-sm mt-1">Enter the license key from your Polar purchase email</p>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#7096B8] mb-2">License Key</label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleKeySubmit()}
                    className="w-full px-4 py-3 bg-[#040B14] border border-[#00D4FF]/20 rounded-lg text-[#E0EFFF] font-mono text-sm placeholder:text-[#3A5570] focus:border-[#00D4FF]/60 focus:outline-none tracking-widest"
                    autoFocus
                    spellCheck={false}
                  />
                </div>

                {error && <p className="text-[#FF3366] text-xs mb-3">{error}</p>}

                <button
                  onClick={handleKeySubmit}
                  className="w-full px-6 py-3 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition"
                >
                  Continue
                </button>
                <p className="text-center text-[#3A5570] text-xs mt-4">
                  Don&apos;t have a key?{" "}
                  <a href="/pricing" className="text-[#00D4FF] hover:underline">Get Pro for $4.99/mo</a>
                </p>
              </>
            )}

            {/* Step: create/link account */}
            {step === "account" && (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#00FF88]/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-7 h-7 text-[#00FF88]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#E0EFFF]">Link Your Account</h2>
                  <p className="text-[#7096B8] text-sm mt-1">Create a new account or log into an existing one to activate Pro</p>
                  <div className="mt-3 px-3 py-1.5 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-lg inline-block">
                    <span className="text-[#00D4FF] text-xs font-mono tracking-wider">{licenseKey}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-[#7096B8] mb-1.5">Name (optional)</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#040B14] border border-[#00D4FF]/20 rounded-lg text-[#E0EFFF] text-sm placeholder:text-[#3A5570] focus:border-[#00D4FF]/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7096B8] mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#040B14] border border-[#00D4FF]/20 rounded-lg text-[#E0EFFF] text-sm placeholder:text-[#3A5570] focus:border-[#00D4FF]/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7096B8] mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                        className="w-full px-4 py-2.5 pr-10 bg-[#040B14] border border-[#00D4FF]/20 rounded-lg text-[#E0EFFF] text-sm placeholder:text-[#3A5570] focus:border-[#00D4FF]/60 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A5570] hover:text-[#7096B8]"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && <p className="text-[#FF3366] text-xs mb-3">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep("key"); setError(""); }}
                    className="px-4 py-3 border border-[#00D4FF]/20 text-[#7096B8] rounded-lg hover:bg-[#00D4FF]/5 transition text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleActivate}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition disabled:opacity-50"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Activating...</> : <><Zap className="w-4 h-4" /> Activate Pro</>}
                  </button>
                </div>
                <p className="text-center text-[#3A5570] text-xs mt-3">
                  Existing account? Use the same email + password to log in and link the key.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
