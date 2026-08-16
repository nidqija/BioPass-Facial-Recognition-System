import { Ticket, Sparkles, ShieldCheck } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand / Logo Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706]/10 text-[#D97706] ring-1 ring-[#D97706]/20">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-[#0F172A]">
                EvenTix
              </span>
              <span className="rounded-full bg-[#D97706]/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#D97706]">
                Live
              </span>
            </div>
            <p className="text-xs font-semibold text-[#475569]">
                Powered by BioPass
            </p>
          </div>
        </div>

        {/* Live Status / Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1 font-mono text-[11px] font-semibold text-[#334155] sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
            <span>Fast-Track Entry Ready</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] px-2.5 py-1 font-mono text-xs font-semibold text-[#0F172A]">
            <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
            <span>GA PASS</span>
          </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] px-2.5 py-1 font-mono text-xs font-semibold text-[#0F172A]">
            <a href="/admin/auth-page">Admin Sign In</a>
          </div>
        </div>

      </div>
    </header>
  );
}