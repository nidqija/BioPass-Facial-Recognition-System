import React, { useState } from "react";
import Navbar from "../reusable_components/Navbar";
import { useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Users,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface EventItem {
  eventId: string;
  artist: string;
  genre: string;
  venue: string;
  city: string;
  date: string;
  doorsOpen: string;
  price: string;
  tier: string;
  status: string;
  accentColor: string;
}



export default function ManageEventsPage() {
 

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);


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

// useeffect to fetch events from the backend when the component mounts

  useEffect(() =>{
    const fetchEvents = async() =>{
    const response = await fetch("http://localhost:8000/api/admin/events-list")
        const data = await response.json()

        console.log("Fetched events:", data); // Log the fetched data


        if (data && Array.isArray(data.events)) {
         const mappedEvents: EventItem[] = data.events.map((event: any, index: number) => ({
          eventId: getValues(event.eventId || event.id, `concert-${index}`),
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
        }
    }
     
    fetchEvents()
  }, [])

  // Form State
  const [formData, setFormData] = useState<Omit<EventItem, "eventId">>({
    artist: "",
    genre: "",
    venue: "",
    city: "",
    date: "",
    doorsOpen: "",
    price: "",
    tier: "",
    status: "",
    accentColor: "",
  });

  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setFormData({
      artist: "",
      genre: "",
      venue: "",
      city: "",
      date: "",
      doorsOpen: "",
      price: "",
      tier: "",
      status: "Upcoming",
      accentColor: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: EventItem) => {
    setEditingEventId(event.eventId);
    setFormData({
      artist: event.artist,
      genre: event.genre,
      venue: event.venue,
      city: event.city,
      date: event.date,
      doorsOpen: event.doorsOpen,
      price: event.price,
      tier: event.tier,
      status: event.status,
      accentColor: event.accentColor,
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEventId) {
      // Edit existing event
      setEvents((prev) =>
        prev.map((evt) =>
          evt.eventId === editingEventId ? { ...evt, ...formData } : evt
        )
      );
    } else {
      // Add new event
      const newEvent: EventItem = {
        eventId: `EVT-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
      };
      setEvents((prev) => [newEvent, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      setEvents((prev) => prev.filter((evt) => evt.eventId !== id));
    }
  };

  const filteredEvents = events.filter(
    (evt) =>
      evt.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.eventId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-amber-500" />
              Event Management
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Create, configure, and manage event schedules and entry thresholds.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition shadow-lg shadow-amber-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Event
          </button>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search events by title, venue, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
          <span className="text-xs text-slate-500">
            Showing {filteredEvents.length} of {events.length} events
          </span>
        </section>

        {/* Events Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt) => (
              <div
                key={evt.eventId}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-amber-400 font-semibold">
                      {evt.eventId}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                        evt.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : evt.status === "Upcoming"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : evt.status === "Completed"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white mb-3 line-clamp-1">
                    {evt.city} - {evt.artist} ({evt.genre})
                  </h2>

                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {evt.date} 
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{evt.price.toLocaleString()} Tickets Available</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(evt)}
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(evt.eventId)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 border border-slate-800/50 rounded-xl">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">No events found matching your search query.</p>
            </div>
          )}
        </section>
      </main>

      {/* Modal Dialog (Add / Edit Event) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingEventId ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Summit 2026"
                  value={formData.accentColor}
                  onChange={(e) =>
                    setFormData({ ...formData, accentColor: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Venue / Gate Details
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hall 4, Gate B"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.doorsOpen}
                    onChange={(e) =>
                      setFormData({ ...formData, doorsOpen: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.accentColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accentColor: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as EventItem["status"],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingEventId ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}