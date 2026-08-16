import React, { useState } from "react";
import Navbar from "../reusable_components/Navbar";
import {
  Users,
  ShieldCheck,
  Camera,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3,
  ListFilter,
} from "lucide-react";

interface VerificationLog {
  id: string;
  name: string;
  email: string;
  event: string;
  confidence: number;
  status: "Verified" | "Failed" | "Pending";
  timestamp: string;
  device: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "events" | "attendance">("logs");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [logs] = useState<VerificationLog[]>([
    {
      id: "LOG-1092",
      name: "Alex Johnson",
      email: "alex.j@example.com",
      event: "Neon Beats Cyber Fest 2026",
      confidence: 99.4,
      status: "Verified",
      timestamp: "2026-08-15 22:45:12",
      device: "Kiosk #01 (Gate A)",
    },
    {
      id: "LOG-1091",
      name: "Sophia Martinez",
      email: "sophia.m@example.com",
      event: "Neon Beats Cyber Fest 2026",
      confidence: 98.7,
      status: "Verified",
      timestamp: "2026-08-15 22:42:05",
      device: "Kiosk #02 (Gate A)",
    },
    {
      id: "LOG-1090",
      name: "Marcus Vance",
      email: "marcus.v@example.com",
      event: "Tech Summit 2026",
      confidence: 72.1,
      status: "Failed",
      timestamp: "2026-08-15 22:38:50",
      device: "Kiosk #04 (Gate B)",
    },
    {
      id: "LOG-1089",
      name: "Elena Rostova",
      email: "elena.r@example.com",
      event: "Symphony Under The Stars",
      confidence: 99.9,
      status: "Verified",
      timestamp: "2026-08-15 22:35:19",
      device: "Kiosk #03 (VIP Entrance)",
    },
    {
      id: "LOG-1088",
      name: "David Chen",
      email: "david.c@example.com",
      event: "Neon Beats Cyber Fest 2026",
      confidence: 88.5,
      status: "Pending",
      timestamp: "2026-08-15 22:30:00",
      device: "Kiosk #01 (Gate A)",
    },
  ]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || log.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      {/* Mini Action Sub-Navbar */}
      <nav aria-label="Admin Sub Navigation" className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <ListFilter className="w-4 h-4" />
                Live Feed
              </button>

              <a href="/admin/manage-events"
               className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab ==="events"
                    ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Manage Events
              </a>

              < a href="/admin/attendance"
                type="button"
                onClick={() => setActiveTab("attendance")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "attendance"
                    ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                View Attendance Metrics
              </a>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Mode Active
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
              BioPass Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Real-time facial verification monitoring, access logs, and system metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="refresh-btn"
              aria-label="Refresh Dashboard Data"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              Refresh
            </button>
            <button
              type="button"
              id="export-btn"
              aria-label="Export Access Logs"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition cursor-pointer shadow-lg shadow-amber-600/20"
            >
              <Download className="w-4 h-4" />
              Export Logs
            </button>
          </div>
        </section>

        {/* Stats Overview Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Registered</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-white">12,840</span>
              <span className="ml-2 text-xs font-medium text-emerald-400">+14% this week</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verifications Today</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-white">3,421</span>
              <span className="ml-2 text-xs font-medium text-emerald-400">98.2% Accuracy</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Gate Kiosks</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-white">18 / 20</span>
              <span className="ml-2 text-xs font-medium text-slate-400">2 Idle</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Failed Matches</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-white">12</span>
              <span className="ml-2 text-xs font-medium text-rose-400">Flagged for review</span>
            </div>
          </div>
        </section>

        {/* Verification Logs Table Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Table Header Controls */}
          <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Biometric Verification Stream</h2>
              <p className="text-xs text-slate-400">Live feed of facial scans across venue entrance kiosks.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  id="search-input"
                  name="search"
                  placeholder="Search by name, email, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition"
                  aria-label="Search access logs"
                />
              </div>

              <div className="relative w-full sm:w-40">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  id="status-select"
                  name="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition cursor-pointer appearance-none"
                  aria-label="Filter logs by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th scope="col" className="py-3.5 px-6">Log ID</th>
                  <th scope="col" className="py-3.5 px-6">Attendee</th>
                  <th scope="col" className="py-3.5 px-6">Event</th>
                  <th scope="col" className="py-3.5 px-6">Match Confidence</th>
                  <th scope="col" className="py-3.5 px-6">Status</th>
                  <th scope="col" className="py-3.5 px-6">Device Location</th>
                  <th scope="col" className="py-3.5 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-6 font-mono text-xs text-amber-400 font-semibold">
                        {log.id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{log.name}</div>
                        <div className="text-xs text-slate-500">{log.email}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{log.event}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                log.confidence > 90
                                  ? "bg-emerald-500"
                                  : log.confidence > 80
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${log.confidence}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold">
                            {log.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {log.status === "Verified" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                        {log.status === "Failed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                        {log.status === "Pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">{log.device}</td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">{log.timestamp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                      No verification logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}