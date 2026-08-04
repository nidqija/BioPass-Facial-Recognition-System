"use client";

import { Button } from "@/components/ui/button";
import Footer from "../reusable_components/Footer";
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  AlertCircle,
} from "lucide-react";

let event_id = "BP-2607-0843"

// create an interface for the props that will be passed to the KioskPage component
// this will be parsed by the server and passed to the component as props

interface KioskPageProps{
  id: string;
  artist: string;
  genre: string;
  venue: string;
  city: string;
  date: string;
  doorsOpen: string;
  price: string;
  tier: string;
  status: "Available" | "Selling Fast" | "Sold Out";
  accentColor: string;
}

export default function KioskPage() {
  const STREAM_URL = `http://localhost:8000/api/video-verification/${event_id}`;

  

  

  return (
    <>
      <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans antialiased text-[#010101]">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-[#E2E8F0] bg-white/80 px-6 py-4 backdrop-blur-md sm:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706]/10 text-[#D97706] ring-1 ring-[#D97706]/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="p-2 font-bold tracking-tight text-emerald-400 font-serif">
                Express Entry Kiosk
              </h1>
              <p className="text-xs font-medium text-[#64748B]">
                Midnight Static • Grand Hall
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            Scanner Active
          </div>
        </header>

        {/* Main Kiosk Area */}
        <main className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
          <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-12 lg:items-center">
            
            {/* Camera Feed Container */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-[#CBD5E1] bg-slate-900 shadow-xl sm:aspect-[4/3]">
                {/* Live Backend MJPEG Stream */}
                <img
                  src={STREAM_URL}
                  alt="Live Backend Face Verification Feed"
                  className="h-full w-full object-cover"
                />

                {/* Viewfinder Overlay */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-6 sm:p-8">
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 backdrop-blur-md shadow-sm">
                    <Camera className="h-4 w-4 text-[#D97706]" />
                    <span className="font-mono text-xs font-medium tracking-wide text-white">
                      Align face within circle
                    </span>
                  </div>

                  <div className="relative h-56 w-56 rounded-full border-2 border-dashed border-[#D97706] bg-[#D97706]/10 shadow-[0_0_40px_rgba(217,119,6,0.25)] sm:h-72 sm:w-72">
                    <div className="absolute inset-0 rounded-full border-2 border-[#D97706]/50 animate-ping" />
                    <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#D97706] shadow-sm" />
                    <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#D97706] shadow-sm" />
                  </div>

                  <p className="font-mono text-xs text-slate-200 drop-shadow-sm">
                    Hold still for fast pass verification
                  </p>
                </div>
              </div>
            </div>

            {/* Action & Status Side Panel */}
            <div className="flex flex-col justify-center space-y-6 lg:col-span-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#D97706]">
                  <Sparkles className="h-4 w-4" />
                  Facial Recognition
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                  Ready to Scan
                </h2>
                <p className="text-sm text-[#64748B]">
                  Look directly into the camera to automatically match your registered Face ID ticket pass.
                </p>
              </div>

              {/* Instruction Card */}
              <div className="space-y-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">Remove Hats or Sunglasses</p>
                    <p className="text-xs text-[#64748B]">Ensure your face is well-lit for instant verification.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" />
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">Having Issues?</p>
                    <p className="text-xs text-[#64748B]">Switch to manual entry or ask a staff member for support.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  className="h-14 w-full rounded-xl bg-[#D97706] text-base font-semibold tracking-wide text-white shadow-lg shadow-[#D97706]/25 transition-all hover:bg-[#B45309] active:scale-[0.99]"
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Verify Identity
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-xl border-[#CBD5E1] bg-white text-[#334155] shadow-xs transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Manual Ticket Lookup
                </Button>
              </div>
            </div>

          </div>
        </main>

        <footer className="border-t border-[#E2E8F0] bg-white px-8 py-4 text-center font-mono text-xs text-[#64748B]">
          Kiosk ID: KSK-04 • Powered by Midnight Static Verification System
        </footer>
      </div>
      <Footer />
    </>
  );
}