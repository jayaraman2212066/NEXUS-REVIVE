"use client";

import { useState, useEffect } from "react";
import { Star, X, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  fileFormat?: string;
}

export function ReviewModal({ open, onClose, fileFormat }: ReviewModalProps) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Check if user already reviewed on mount
  useEffect(() => {
    if (!open) return;
    fetch("/api/reviews/stats")
      .then((r) => r.json())
      .then((d) => { if (d.hasReviewed) setAlreadyReviewed(true); })
      .catch(() => {});
  }, [open]);

  const handleSubmit = async () => {
    if (!stars) { setError("Please select a star rating."); return; }
    if (name.trim().length < 2) { setError("Please enter your name."); return; }
    if (body.trim().length < 10) { setError("Please write at least 10 characters."); return; }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars, reviewBody: body, displayName: name }),
      });
      const data = await res.json();

      if (res.status === 409) { setAlreadyReviewed(true); return; }
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      setDone(true);
      setTimeout(onClose, 2200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const LABELS = ["", "Poor", "Below Average", "Average", "Good", "Excellent"];
  const active = hovered || stars;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#040B14]/90 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0A1628] border border-[#00D4FF]/25 rounded-2xl p-8 max-w-md w-full shadow-[0_0_80px_rgba(0,212,255,0.12)] relative"
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
          >
            {/* Skip button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#3A5570] hover:text-[#7096B8] transition"
              title="Skip review"
            >
              <X className="w-4 h-4" />
            </button>

            {done ? (
              <div className="text-center py-4">
                <CheckCircle className="w-14 h-14 text-[#00FF88] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#E0EFFF] mb-2">Thank you!</h3>
                <p className="text-[#7096B8] text-sm">Your review helps others discover Nexus Revive.</p>
              </div>
            ) : alreadyReviewed ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-[#00D4FF] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#E0EFFF] mb-2">Already Reviewed</h3>
                <p className="text-[#7096B8] text-sm mb-6">You&apos;ve already shared your feedback. Thank you!</p>
                <button onClick={onClose} className="px-6 py-2 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg">
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">⭐</div>
                  <h3 className="text-xl font-bold text-[#E0EFFF]">How was your experience?</h3>
                  <p className="text-[#7096B8] text-sm">Your file{fileFormat ? ` (${fileFormat})` : ""} was successfully revived!</p>
                </div>

                {/* Star picker */}
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setStars(s)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className="w-10 h-10 transition-colors"
                        fill={s <= active ? "#FFD700" : "transparent"}
                        stroke={s <= active ? "#FFD700" : "#3A5570"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm font-medium mb-5 h-5" style={{ color: active >= 4 ? "#00FF88" : active >= 3 ? "#FFD700" : active > 0 ? "#FF6B35" : "transparent" }}>
                  {LABELS[active]}
                </p>

                {/* Name */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Your name (e.g. Sarah J.)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    className="w-full px-4 py-2.5 bg-[#040B14] border border-[#00D4FF]/20 rounded-lg text-[#E0EFFF] text-sm placeholder:text-[#3A5570] focus:border-[#00D4FF]/50 focus:outline-none"
                  />
                </div>

                {/* Review text */}
                <div className="mb-4">
                  <textarea
                    placeholder="Tell others what you recovered and how it helped..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#040B14] border border-[#00D4FF]/20 rounded-lg text-[#E0EFFF] text-sm placeholder:text-[#3A5570] focus:border-[#00D4FF]/50 focus:outline-none resize-none"
                  />
                  <div className="text-right text-xs text-[#3A5570] mt-1">{body.length}/500</div>
                </div>

                {error && (
                  <p className="text-[#FF3366] text-xs mb-3 text-center">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-3 border border-[#00D4FF]/20 text-[#7096B8] rounded-lg hover:bg-[#00D4FF]/5 transition text-sm"
                  >
                    Skip
                  </button>
                </div>
                <p className="text-center text-[#3A5570] text-xs mt-3">One review per session · No account needed</p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
