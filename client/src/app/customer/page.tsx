"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  ReceiptText,
  Camera,
  Upload,
  ShieldCheck,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import Navbar from "../reusable_components/Navbar";
import Footer from "../reusable_components/Footer";
import { useParams } from "react-router-dom";

const FASTAPI_URL = import.meta.env.FASTAPI_URL || "http://localhost:8000";

interface ConcertById {
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

function Barcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return Array.from({ length: 46 }, () => {
      h = (h * 1103515245 + 12345) >>> 0;
      const w = 1 + (h % 4);
      return w;
    });
  }, [seed]);

  return (
    <div className="flex h-10 items-stretch gap-[2px]" aria-hidden="true">
      {bars.map((w, i) => (
        <span
          key={i}
          style={{ width: `${w}px` }}
          className={i % 7 === 0 ? "bg-[#D97706]" : "bg-[#0F172A]/80"}
        />
      ))}
    </div>
  );
}

function Perforation() {
  return (
    <div className="relative py-0">
      <div className="absolute left-[-14px] top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-[#F8FAFC] border-r border-[#CBD5E1]" />
      <div className="absolute right-[-14px] top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-[#F8FAFC] border-l border-[#CBD5E1]" />
      <div
        className="border-t-2"
        style={{ borderStyle: "dashed", borderColor: "#CBD5E1" }}
      />
    </div>
  );
}

function UploadSlot({
  id,
  label,
  icon,
  hint,
  accent,
  accept,
  tag,
  capture,
  file,
  onChange,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  hint: string;
  accent: string;
  accept: string;
  capture?: "user" | "environment";
  tag?: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const fileName = file ? file.name : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#475569]"
        >
          {icon}
          {label}
        </Label>
        {tag && (
          <span
            className="rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
            style={{ borderColor: `${accent}50`, color: accent, background: `${accent}12` }}
          >
            {tag}
          </span>
        )}
      </div>

      <div
        className="relative flex items-center gap-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3 transition-colors hover:border-[#CBD5E1]"
        style={fileName ? { borderColor: "#059669", background: "#ECFDF5" } : undefined}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
          style={{ background: fileName ? "#D1FAE5" : `${accent}18`, color: fileName ? "#059669" : accent }}
        >
          {fileName ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-[#0F172A]">
            {fileName ?? (
              <>
                <span style={{ color: accent }} className="font-semibold">
                  Choose file
                </span>{" "}
                <span className="text-[#64748B]">or drop it here</span>
              </>
            )}
          </p>
          <p className="text-[11px] text-[#64748B]">{fileName ? "Uploaded — ready for scan" : hint}</p>
        </div>

        <Input
          id={id}
          type="file"
          accept={accept}
          capture={capture}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

export default function CustomerPage() {
  const [fullName, setFullName] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [eventsById, setEventsById] = useState<ConcertById[]>([]);
  const [loading, setLoading] = useState(false);
  const { concertId } = useParams<{ concertId: string }>();

  const ready = fullName.trim().length > 1 && paymentFile && faceFile;
  const currentConcert = eventsById[0];

  useEffect(() => {
    const fetchEventsbyId = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${FASTAPI_URL}/api/get-event/${concertId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();

        if (data.event) {
          const mappedEvents: ConcertById = {
            id: data.event.id,
            artist: data.event.artist,
            genre: data.event.genre,
            venue: data.event.venue,
            city: data.event.city,
            date: data.event.date,
            doorsOpen: data.event.doorsOpen,
            price: data.event.price,
            tier: data.event.tier,
            status: data.event.status,
            accentColor: data.event.accentColor,
          };

          setEventsById([mappedEvents]);
          console.log("Fetched events by ID:", mappedEvents);
        }
      } catch (error) {
        console.error("Error fetching events by ID:", error);
      } finally {
        setLoading(false);
      }
    };

    if (concertId) {
      fetchEventsbyId();
    }
  }, [concertId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceFile || !paymentFile || !concertId) return;

    setLoading(true);

    // Build multipart/form-data payload for binary image upload
    const formData = new FormData();
    formData.append("customerId", `cust_${Date.now()}`);
    formData.append("fullName", fullName);
    formData.append("paymentFile", paymentFile.name);
    formData.append("faceImage", faceFile); // Sends actual File object

    try {
      const res = await fetch(`${FASTAPI_URL}/api/insert-customer-for-event/${concertId}`, {
        method: "POST",
        body: formData, // Browser automatically sets multipart/form-data headers
      });

      if (!res.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await res.json();
      console.log("Form submitted successfully:", data);

      // Clear form inputs
      setFullName("");
      setPaymentFile(null);
      setFaceFile(null);

    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 font-sans antialiased sm:p-10">
        <div className="w-full max-w-md">
          {/* Eyebrow */}
          <div className="mb-4 flex items-center justify-between px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#64748B]">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D97706]" />
              Concert Entry Registration
            </span>
            <span className="font-semibold text-[#334155]">{concertId}</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08)]">
            {/* Header stub */}
            <div className="border-b border-[#E2E8F0] bg-[#F1F5F9] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold tracking-tight text-[#0F172A]">{currentConcert?.artist || "Midnight Static"}</p>
                  <p className="text-[11px] font-medium text-[#64748B]">Live at The Grand Hall</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-[10px] uppercase tracking-widest text-[#64748B]">Tier</p>
                  <p className="text-sm font-bold text-[#D97706]">{currentConcert?.tier || "GA"}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-[#64748B]">
                <span className="font-medium text-[#334155]">{currentConcert?.date || "SAT · SEP 12 · 2026"}</span>
                <span className="h-1 w-1 rounded-full bg-[#94A3B8]" />
                <span className="font-medium text-[#334155]">{currentConcert?.doorsOpen || "DOORS 7:00 PM"}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Route line */}
              <div className="flex items-center gap-3 px-6 pt-5 font-mono text-[11px] text-[#64748B]">
                <span className="font-semibold text-[#0F172A]">REGISTRATION</span>
                <span className="h-px flex-1 bg-[#E2E8F0]" />
                <ArrowRight className="h-3 w-3 text-[#D97706]" />
                <span className="h-px flex-1 bg-[#E2E8F0]" />
                <span className="font-semibold text-[#0F172A]">VENUE ENTRY</span>
              </div>

              <div className="space-y-5 px-6 pb-6 pt-5">
                {/* Full name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#475569]"
                  >
                    <User className="h-3.5 w-3.5 text-[#D97706]" />
                    Attendee Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="As it appears on your ID"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 border-[#CBD5E1] bg-[#F8FAFC] px-3 font-mono text-sm tracking-wide text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:border-[#D97706] focus-visible:ring-[#D97706]/20"
                  />
                </div>

                <UploadSlot
                  id="paymentProof"
                  label="Proof of Payment"
                  icon={<ReceiptText className="h-3.5 w-3.5 text-[#059669]" />}
                  hint="Receipt screenshot, PDF, or PNG — max 5MB"
                  accent="#059669"
                  accept="image/*,.pdf"
                  file={paymentFile}
                  onChange={setPaymentFile}
                />

                <UploadSlot
                  id="photoCopy"
                  label="Face ID Photo"
                  tag="Required"
                  icon={<Camera className="h-3.5 w-3.5 text-[#D97706]" />}
                  hint="Clear selfie, good light, eyes forward — used to skip the will-call line"
                  accent="#D97706"
                  accept="image/*"
                  capture="user"
                  file={faceFile}
                  onChange={setFaceFile}
                />
              </div>

              <Perforation />

              {/* Bottom stub */}
              <div className="space-y-4 bg-[#F1F5F9] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#64748B]">
                      Scan at the door
                    </p>
                    <Barcode seed={fullName || concertId || "0000"} />
                  </div>
                  <p className="font-mono text-xs font-medium text-[#64748B]">{concertId}</p>
                </div>

                <Button
                  type="submit"
                  disabled={!ready || loading}
                  className="h-12 w-full rounded-lg bg-[#D97706] text-sm font-semibold uppercase tracking-wide text-white shadow-[0_10px_25px_-5px_rgba(217,119,6,0.3)] transition-all hover:bg-[#B45309] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </span>
                  ) : ready ? (
                    "Issue My Concert Pass"
                  ) : (
                    "Complete All Fields to Continue"
                  )}
                </Button>
                <p className="text-center text-[11px] text-[#64748B]">
                  Your pass is generated instantly and sent to your inbox — skip will-call, walk straight to face scan.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}