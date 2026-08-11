import React from "react";
import { ShieldCheck } from "lucide-react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-[#CBD5E1] bg-white py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 font-mono text-xs font-medium text-[#475569] sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#D97706]" />
          <span>© {new Date().getFullYear()} Midnight Static. All rights reserved.</span>
        </div>
        
        <p className="text-[11px] text-[#64748B]">
          Fast-Track Entry System · Powered by Face ID
        </p>
      </div>
    </footer>
  );
}