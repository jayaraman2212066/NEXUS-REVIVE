"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  stars: number;
  body: string;
  displayName: string;
  location: string;
  fileFormat: string;
  createdAt: string;
}

interface Stats {
  total: number;
  avg: number;
  distribution: Record<number, number>;
}

function StarRow({ count, total, stars }: { count: number; total: number; stars: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors: Record<number, string> = { 5: "#00FF88", 4: "#00D4FF", 3: "#FFD700", 2: "#FF6B35", 1: "#FF3366" };
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-[#7096B8] text-right">{stars}</span>
      <Star className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
      <div className="flex-1 h-1.5 bg-[#112040] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: colors[stars] }} />
      </div>
      <span className="w-8 text-right text-[#3A5570]">{pct}%</span>
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <div className="bg-[#0A1628]/70 border border-[#00D4FF]/10 rounded-2xl p-5 flex flex-col gap-3 min-w-[300px] max-w-[340px] flex-shrink-0 hover:border-[#00D4FF]/25 transition">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((s) => (
          <Star key={s} className="w-4 h-4" fill={s <= r.stars ? "#FFD700" : "transparent"} stroke={s <= r.stars ? "#FFD700" : "#3A5570"} strokeWidth={1.5} />
        ))}
      </div>
      {/* Quote */}
      <div className="relative">
        <Quote className="w-5 h-5 text-[#00D4FF]/20 absolute -top-1 -left-1" />
        <p className="text-[#C8DCF0] text-sm leading-relaxed pl-4 line-clamp-4">{r.body}</p>
      </div>
      {/* Author */}
      <div className="mt-auto pt-2 border-t border-[#00D4FF]/8 flex items-center justify-between">
        <div>
          <p className="text-[#E0EFFF] text-sm font-semibold">{r.displayName}</p>
          {r.location && <p className="text-[#3A5570] text-xs">{r.location}</p>}
        </div>
        {r.fileFormat && (
          <span className="text-xs px-2 py-0.5 bg-[#112040] border border-[#00D4FF]/10 rounded font-mono text-[#7096B8]">
            {r.fileFormat}
          </span>
        )}
      </div>
    </div>
  );
}

export function ReviewSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch("/api/reviews/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/reviews?featured=true").then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => {});
  }, []);

  const avg = stats?.avg ?? 4.6;
  const total = stats?.total ?? 100000;
  const dist = stats?.distribution ?? { 5: 68000, 4: 24000, 3: 5000, 2: 2000, 1: 1000 };
  const displayTotal = total >= 1000 ? `${(total / 1000).toFixed(0)}k+` : total.toString();

  return (
    <section id="reviews" className="py-24 px-6 bg-[#0A1628]/30">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-[#E0EFFF] mb-2">Trusted by Thousands</h2>
          <p className="text-[#7096B8]">Real people. Real files. Real recoveries.</p>
        </motion.div>

        {/* Aggregate block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center gap-10 justify-center mb-14"
        >
          {/* Big score */}
          <div className="text-center">
            <div className="text-8xl font-black text-[#E0EFFF] leading-none">{avg.toFixed(1)}</div>
            <div className="flex justify-center gap-1 mt-2 mb-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className="w-6 h-6" fill={s <= Math.round(avg) ? "#FFD700" : "transparent"} stroke={s <= Math.round(avg) ? "#FFD700" : "#3A5570"} strokeWidth={1.5} />
              ))}
            </div>
            <p className="text-[#7096B8] text-sm">{displayTotal} verified reviews</p>
          </div>

          {/* Distribution bars */}
          <div className="w-full max-w-xs space-y-2">
            {[5,4,3,2,1].map((s) => (
              <StarRow key={s} stars={s} count={dist[s] ?? 0} total={total} />
            ))}
          </div>

          {/* Trust callouts */}
          <div className="space-y-3 text-sm">
            {[
              { val: "98%", label: "successful recoveries" },
              { val: "<30s", label: "average processing" },
              { val: "50+", label: "formats supported" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="text-2xl font-bold text-[#00D4FF]">{c.val}</div>
                <div className="text-[#7096B8]">{c.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scrolling review cards */}
        {reviews.length > 0 && (
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#040B14] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#040B14] to-transparent z-10 pointer-events-none" />

            <motion.div
              className="flex gap-4 pb-2"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              style={{ width: "max-content" }}
            >
              {/* Duplicate for seamless loop */}
              {[...reviews, ...reviews].map((r, i) => (
                <ReviewCard key={`${r.id}-${i}`} r={r} />
              ))}
            </motion.div>
          </div>
        )}

        {/* Static grid for smaller screens / fallback */}
        {reviews.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {reviews.slice(0, 6).map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              >
                <ReviewCard r={r} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
