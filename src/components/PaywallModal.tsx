"use client";

import { Zap, X, Lock, Eye, Download, Calendar } from "lucide-react";
import { useConversionStore, PaywallType } from "@/stores/conversion.store";

const CHECKOUT_URL = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || "#";

interface PaywallConfig {
  icon: React.ReactNode;
  title: string;
  color: string;
}

const configs: Record<NonNullable<PaywallType>, PaywallConfig> = {
  preview_limit: {
    icon: <Eye className="w-8 h-8" />,
    title: "Preview Limit Reached",
    color: "#8B5CF6",
  },
  download_limit: {
    icon: <Download className="w-8 h-8" />,
    title: "Free Downloads Exhausted",
    color: "#FF6B35",
  },
  pro_required: {
    icon: <Lock className="w-8 h-8" />,
    title: "Pro Format",
    color: "#00D4FF",
  },
  daily_limit: {
    icon: <Calendar className="w-8 h-8" />,
    title: "Daily Limit Reached",
    color: "#FFD700",
  },
};

export function PaywallModal() {
  const { paywallType, paywallMessage, setPaywall } = useConversionStore();

  if (!paywallType) return null;

  const config = configs[paywallType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B14]/80 backdrop-blur-sm">
      <div className="bg-[#0A1628] border border-[#00D4FF]/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(0,212,255,0.15)] relative">
        <button
          onClick={() => setPaywall(null)}
          className="absolute top-4 right-4 text-[#7096B8] hover:text-[#E0EFFF] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto"
          style={{ background: `${config.color}20`, color: config.color }}>
          {config.icon}
        </div>

        <h2 className="text-2xl font-bold text-[#E0EFFF] text-center mb-3">{config.title}</h2>
        <p className="text-[#7096B8] text-center mb-8 text-sm leading-relaxed">{paywallMessage}</p>

        {/* What you get with Pro */}
        <div className="bg-[#112040]/60 rounded-xl p-4 mb-6 space-y-2">
          <p className="text-[#00D4FF] text-xs font-bold uppercase tracking-wider mb-3">Pro unlocks everything</p>
          {[
            "Unlimited previews & downloads",
            "Download .docx, .pdf, .xlsx",
            "Unlimited daily conversions",
            "Batch convert 50 files",
            "500MB max file size",
            "Priority processing",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-[#E0EFFF]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition"
          >
            <Zap className="w-5 h-5" />
            Upgrade to Pro — $4.99/mo
          </a>
          <a
            href="/pricing"
            onClick={() => setPaywall(null)}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-[#00D4FF]/30 text-[#00D4FF] font-medium rounded-lg hover:bg-[#00D4FF]/5 transition text-sm"
          >
            I have a license key
          </a>
          <button
            onClick={() => setPaywall(null)}
            className="w-full px-6 py-3 text-[#3A5570] font-medium rounded-lg hover:text-[#7096B8] transition text-sm"
          >
            Continue with free tier
          </button>
        </div>

        <p className="text-center text-[#3A5570] text-xs mt-4">
          Cancel anytime • No contracts
        </p>
      </div>
    </div>
  );
}
