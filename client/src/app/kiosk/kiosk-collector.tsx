"use client";

import React, { useEffect } from "react";
import Footer from "../reusable_components/Footer";
import { Button } from "@/components/ui/button";
import {
  Camera,
  MapPin,
  CalendarDays,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

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






export default function KioskCollector(): React.ReactElement {

  const [mappedEvents, setMappedEvents] = React.useState<Concert[]>([]);

  useEffect(() =>{
    const fetchEvents = async() => {
        try {
           // create a fetch request to the backend to get the events
           // useEffect is used to fetch the events when the component is mounted
            const response = await fetch("http://localhost:8000/api/get-events");
            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }

            // get the response data 
            const data = await response.json();
            const rawEvents: any[] = Array.isArray(data)
          ? data
          : data.events || data.items || data.Items || [];

            // map the raw events data from the backend to the concert interface
            // ensure data types are correct and handle any missing fields with default values
            const mappedEvents : Concert[] = rawEvents.map((event : any , index : number) =>({
                id : event.id || event.eventId || `event-${index}`,
                artist : event.artist || event.performer || "Unknown Artist",
                genre : event.genre || event.category || "Unknown Genre",
                venue : event.venue || event.location || "Unknown Venue",
                city : event.city || event.town || "Unknown City",
                date : event.date || event.eventDate || "Unknown Date",
                doorsOpen : event.doorsOpen || event.startTime || "Unknown Time",
                price : event.price || event.ticketPrice || "Unknown Price",
                tier : event.tier || event.ticketTier || "Unknown Tier",
                status : event.status || "Available",
                accentColor : event.accentColor || "#D97706",
            }));
            
            // set the mapped events to the state
            // required as the mapped events will be used to render the event cards in the UI
            setMappedEvents(mappedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };
    // recursively call the fetchEvents function to keep the events updated in real-time
    fetchEvents();
},[])


  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#F8FAFC] font-sans antialiased text-[#0F172A]">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706]/10 text-[#D97706] ring-1 ring-[#D97706]/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-[#0F172A]">
                  Kiosk Collector Terminals
                </h1>
                <span className="rounded-full bg-[#059669]/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#059669]">
                  Live
                </span>
              </div>
              <p className="text-xs font-medium text-[#64748B]">
                Select an event terminal to begin door entry scanning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] px-3 py-1.5 font-mono text-xs font-semibold text-[#0F172A]">
            <ShieldCheck className="h-4 w-4 text-[#059669]" />
            <span>Door Scanner</span>
          </div>
        </div>
      </header>

      {/* Main Content: Event Cards Grid */}
      <main className="mx-auto my-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#D97706]">
              Active Terminals
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              Available Event Scanners
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mappedEvents.map((event) => (
            <div
              key={event.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D97706] hover:shadow-md"
            >
              {/* Card Header Stub */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F1F5F9] px-6 py-3.5 font-mono">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                  <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
                  <span>{event.artist}</span>
                </div>
                <span className="rounded-md border border-[#CBD5E1] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                  {event.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="text-xl font-extrabold tracking-tight text-[#0F172A] transition-colors group-hover:text-[#D97706]">
                  {event.genre} - {event.tier}
                </h3>

                <div className="mt-3 space-y-1.5 font-mono text-xs text-[#64748B]">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#D97706]" />
                    <span className="font-semibold text-[#334155]">{event.venue}</span>
                    <span>·</span>
                    <span>{event.city}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>{event.date}</span>
                  </p>
                </div>

                {/* Perforation Line Effect */}
                <div className="relative my-5">
                  <div className="absolute left-[-31px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-r border-[#CBD5E1] bg-[#F8FAFC]" />
                  <div className="absolute right-[-31px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-l border-[#CBD5E1] bg-[#F8FAFC]" />
                  <div
                    className="border-t-2"
                    style={{ borderStyle: "dashed", borderColor: "#E2E8F0" }}
                  />
                </div>

                {/* Redirect Button */}
                <Button
                  asChild
                  className="h-11 w-full gap-2 rounded-xl bg-[#D97706] font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#B45309] active:scale-[0.99]"
                >
                  <a href={`/kiosk/${event.id}`}>
                    <span>Open Terminal Kiosk</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}