import React from "react";
import { ShieldCheck } from "lucide-react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 font-mono text-xs text-[#64748B] sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#D97706]" />
          <span>© {new Date().getFullYear()} Midnight Static. All rights reserved.</span>
        </div>
        
        <p className="text-[11px] text-[#94A3B8]">
          Fast-Track Entry System · Powered by Face ID
        </p>
      </div>
    </footer>
  );
}