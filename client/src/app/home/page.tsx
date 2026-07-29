import React, { useEffect, useState } from "react";
import Navbar from "../reusable_components/Navbar";
import {
  MapPin,
  CalendarDays,
  Clock,
  Ticket,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";
import Footer from "../reusable_components/Footer";

interface Concert {
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

export default function HomePage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  const getValues = (val: any, fallback: string = ""): string => {
    if (val === null || val === undefined) {
      return fallback;
    }
    if (typeof val === "object" && val !== null) {
      if ("S" in val) {
        return val.S;
      }
    }
    return String(val);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/api/get-events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        const rawEvents: any[] = Array.isArray(data)
          ? data
          : data.events || data.items || data.Items || [];

        const mappedEvents: Concert[] = rawEvents.map((event: any, index: number) => ({
          id: getValues(event.id, `BP-2607-${index.toString().padStart(4, "0")}`),
          artist: getValues(event.artist, "Unknown Artist"),
          genre: getValues(event.genre, "Unknown Genre"),
          venue: getValues(event.venue, "Unknown Venue"),
          city: getValues(event.city, "Unknown City"),
          date: getValues(event.date, "Unknown Date"),
          doorsOpen: getValues(event.doorsOpen, "Unknown Time"),
          price: getValues(event.price, "Unknown Price"),
          tier: getValues(event.tier, "Unknown Tier"),
          status: getValues(event.status, "Available") as
            | "Available"
            | "Selling Fast"
            | "Sold Out",
          accentColor: getValues(event.accentColor, "#D97706"),
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredConcerts = events.filter((concert) => {
    const query = searchQuery.toLowerCase();
    return (
      (concert.artist || "").toLowerCase().includes(query) ||
      (concert.venue || "").toLowerCase().includes(query) ||
      (concert.genre || "").toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="relative min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#D97706]/20 selection:text-[#D97706]">
        <Navbar />

        <main className="relative overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 h-[450px] w-[450px] -translate-x-1/2 animate-[pulse_6s_ease-in-out_infinite] rounded-full bg-[#D97706]/10 blur-[120px]" />
            <div className="absolute top-1/3 right-10 h-[300px] w-[300px] animate-[ping_10s_linear_infinite] rounded-full bg-[#059669]/10 blur-[100px]" />
            <div
              className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] opacity-40 [background-size:24px_24px]"
              style={{
                maskImage:
                  "radial-gradient(ellipse 60% 50% at 50% 20%, #000 70%, transparent 100%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
            {/* Hero Section */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex animate-bounce items-center gap-2 rounded-full border border-[#D97706]/30 bg-[#D97706]/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-[#D97706] backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D97706] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D97706]" />
                </span>
                <span>2026 CONCERT SEASON · REGISTRATION OPEN</span>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl sm:leading-[1.15]">
                Skip the Will-Call Line with{" "}
                <span className="bg-gradient-to-r from-[#D97706] via-[#B45309] to-[#059669] bg-clip-text text-transparent">
                  Face ID Fast-Pass
                </span>
              </h1>

              <p className="mt-3 text-sm font-medium text-[#334155] sm:text-base">
                Select your upcoming concert below, complete quick registration with face scan, and glide straight through venue doors.
              </p>

              <div className="mt-6 flex items-center justify-center gap-6 font-mono text-xs font-semibold text-[#334155]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#059669]" />
                  <span>Instant Pass Issuance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#D97706]" />
                  <span>Express Door Scanning</span>
                </div>
              </div>
            </div>

            {/* Header & Filter */}
            <div className="mt-12 mb-8 flex flex-col gap-4 border-t border-[#E2E8F0] pt-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#D97706]">
                  Available Shows
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
                  Select a Concert & Venue
                </h2>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
                <input
                  type="text"
                  placeholder="Search band, venue, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#CBD5E1] bg-white pl-9 pr-4 text-xs font-mono text-[#0F172A] placeholder:text-[#64748B] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                />
              </div>
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
                <p className="mt-3 font-mono text-xs font-medium text-[#334155]">
                  Fetching available concerts...
                </p>
              </div>
            ) : (
              /* Concert Cards Grid */
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredConcerts.map((concert) => (
                  <div
                    key={concert.id}
                    className="group relative overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-[0_10px_30px_-15px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D97706] hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)]"
                  >
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F1F5F9] px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: concert.accentColor }}
                        />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                          {concert.genre}
                        </span>
                      </div>
                      <span className="rounded-md border border-[#CBD5E1] bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1E293B]">
                        {concert.status}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-[#0F172A] transition-colors group-hover:text-[#D97706]">
                            {concert.artist}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#334155]">
                            <MapPin className="h-3.5 w-3.5 text-[#D97706]" />
                            <span>{concert.venue}</span>
                            <span className="text-[#94A3B8]">·</span>
                            <span className="text-[#475569]">{concert.city}</span>
                          </p>
                        </div>

                        <div className="text-right font-mono">
                          <p className="text-[10px] font-semibold uppercase text-[#475569]">Pass Price</p>
                          <p className="text-base font-bold text-[#D97706]">{concert.price}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-[#CBD5E1] bg-[#F1F5F9] p-3 font-mono text-xs font-semibold text-[#1E293B]">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#475569]" />
                          <span>{concert.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#475569]" />
                          <span>DOORS {concert.doorsOpen}</span>
                        </div>
                      </div>

                      <div className="relative my-5">
                        <div className="absolute left-[-31px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-r border-[#CBD5E1] bg-[#F8FAFC]" />
                        <div className="absolute right-[-31px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-l border-[#CBD5E1] bg-[#F8FAFC]" />
                        <div
                          className="border-t-2"
                          style={{ borderStyle: "dashed", borderColor: "#CBD5E1" }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#334155]">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
                          <span>Face ID Fast-Pass</span>
                        </div>

                        <a
                          href={`/customer?eventId=${concert.id}`}
                          className="inline-flex items-center h-10 gap-2 rounded-lg bg-[#D97706] px-5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#B45309] active:scale-[0.98]"
                        >
                          <span>Get Pass</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty Search State */}
            {!loading && filteredConcerts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
                <Ticket className="mx-auto h-8 w-8 text-[#64748B]" />
                <p className="mt-2 font-mono text-sm font-semibold text-[#0F172A]">
                  No concerts found
                </p>
                <p className="text-xs text-[#334155]">
                  Try searching for a different band, venue, or genre.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}