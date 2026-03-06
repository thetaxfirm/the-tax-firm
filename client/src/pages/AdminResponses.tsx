/*
 * Admin Dashboard — Questionnaire Responses Review
 * Design: Midnight Boardroom dark luxury aesthetic
 * Only accessible to admin users (owner).
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  User,
  DollarSign,
  Home,
  RefreshCw,
  Building2,
  Briefcase,
  PiggyBank,
  MessageSquare,
  X,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type StatusType = "new" | "reviewed" | "contacted";

const statusConfig: Record<StatusType, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  new: { label: "New", color: "text-[#D4A853]", bg: "bg-[#D4A853]/15 border-[#D4A853]/30", icon: Clock },
  reviewed: { label: "Reviewed", color: "text-blue-400", bg: "bg-blue-400/15 border-blue-400/30", icon: CheckCircle2 },
  contacted: { label: "Contacted", color: "text-emerald-400", bg: "bg-emerald-400/15 border-emerald-400/30", icon: Phone },
};

export default function AdminResponses() {
  const { user, loading: authLoading } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusType | "all">("all");
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesText, setNotesText] = useState("");

  const { data: responses, isLoading, refetch } = trpc.questionnaire.list.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const updateStatusMutation = trpc.questionnaire.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4A853]" size={32} />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center mx-auto mb-6">
              <User size={28} className="text-[#D4A853]" />
            </div>
            <h1 className="text-2xl font-serif text-white mb-3">Admin Access Required</h1>
            <p className="text-[#E8E4DD]/40 mb-8">Please sign in with your admin account to view questionnaire responses.</p>
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all"
            >
              Sign In
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not admin
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-2xl font-serif text-white mb-3">Access Denied</h1>
            <p className="text-[#E8E4DD]/40 mb-8">You don't have permission to view this page.</p>
            <Link href="/" className="inline-flex items-center gap-2 text-[#D4A853] hover:text-[#F0D68A] transition-colors">
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredResponses = responses?.filter(
    (r) => filterStatus === "all" || r.status === filterStatus
  ) ?? [];

  const selectedResponse = responses?.find((r) => r.id === selectedId);

  const handleStatusChange = (id: number, status: StatusType) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleSaveNotes = (id: number) => {
    updateStatusMutation.mutate({ id, status: responses?.find(r => r.id === id)?.status as StatusType ?? "new", notes: notesText });
    setEditingNotes(null);
  };

  const counts = {
    all: responses?.length ?? 0,
    new: responses?.filter((r) => r.status === "new").length ?? 0,
    reviewed: responses?.filter((r) => r.status === "reviewed").length ?? 0,
    contacted: responses?.filter((r) => r.status === "contacted").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />

      <section className="pt-28 pb-16">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#D4A853]/60 hover:text-[#D4A853] transition-colors mb-4">
                <ArrowLeft size={14} /> Back to Site
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-10 bg-[#D4A853]" />
                <span className="text-xs uppercase tracking-[0.3em] text-[#D4A853]">Admin Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-white">
                Discovery Call <span className="gold-gradient-text">Responses</span>
              </h1>
              <p className="mt-2 text-[#E8E4DD]/40">
                Review prospect questionnaire submissions before your discovery calls.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 border border-[#D4A853]/20 text-[#D4A853] text-sm rounded-sm hover:bg-[#D4A853]/10 transition-all"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(["all", "new", "reviewed", "contacted"] as const).map((key) => {
              const isActive = filterStatus === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`p-4 rounded-sm border transition-all duration-300 text-left ${
                    isActive
                      ? "bg-[#D4A853]/10 border-[#D4A853]/40"
                      : "bg-[#0F1729] border-[#D4A853]/10 hover:border-[#D4A853]/25"
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider text-[#E8E4DD]/40">
                    {key === "all" ? "Total" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <p className={`text-2xl font-serif mt-1 ${isActive ? "text-[#D4A853]" : "text-white"}`}>
                    {counts[key]}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#D4A853]" size={32} />
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="text-center py-20 bg-[#0F1729] border border-[#D4A853]/10 rounded-sm">
              <MessageSquare size={40} className="mx-auto text-[#D4A853]/20 mb-4" />
              <h3 className="text-lg font-serif text-white mb-2">No Responses Yet</h3>
              <p className="text-[#E8E4DD]/40 text-sm">
                {filterStatus === "all"
                  ? "Questionnaire responses will appear here once prospects submit them."
                  : `No responses with "${filterStatus}" status.`}
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Response List */}
              <div className="lg:col-span-2 space-y-3">
                {filteredResponses.map((response, i) => {
                  const status = statusConfig[response.status as StatusType];
                  const StatusIcon = status.icon;
                  const isSelected = selectedId === response.id;

                  return (
                    <motion.div
                      key={response.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => setSelectedId(response.id)}
                        className={`w-full text-left p-5 rounded-sm border transition-all duration-300 ${
                          isSelected
                            ? "bg-[#0F1729] border-[#D4A853]/40 shadow-lg shadow-[#D4A853]/5"
                            : "bg-[#0F1729]/60 border-[#D4A853]/10 hover:border-[#D4A853]/25"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-sm border ${status.bg} ${status.color}`}>
                                <StatusIcon size={10} />
                                {status.label}
                              </span>
                              <span className="text-xs text-[#E8E4DD]/30">
                                {new Date(response.submittedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                              {response.email && (
                                <span className="flex items-center gap-1.5 text-[#E8E4DD]/60">
                                  <Mail size={12} className="text-[#D4A853]/60" />
                                  {response.email}
                                </span>
                              )}
                              {response.phone && (
                                <span className="flex items-center gap-1.5 text-[#E8E4DD]/60">
                                  <Phone size={12} className="text-[#D4A853]/60" />
                                  {response.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5 text-[#E8E4DD]/60">
                                <DollarSign size={12} className="text-[#D4A853]/60" />
                                ${response.annualIncome}
                              </span>
                              {response.selfEmployed && (
                                <span className="flex items-center gap-1.5 text-[#E8E4DD]/50">
                                  <Briefcase size={12} className="text-[#D4A853]/50" />
                                  Self-Employed
                                </span>
                              )}
                              {response.ownsRealEstate && (
                                <span className="flex items-center gap-1.5 text-[#E8E4DD]/50">
                                  <Home size={12} className="text-[#D4A853]/50" />
                                  Real Estate
                                </span>
                              )}
                              {response.rothConversionInterest && (
                                <span className="flex items-center gap-1.5 text-[#E8E4DD]/50">
                                  <RefreshCw size={12} className="text-[#D4A853]/50" />
                                  Roth Interest
                                </span>
                              )}
                            </div>
                            {response.expectations && (
                              <p className="mt-2 text-xs text-[#E8E4DD]/35 line-clamp-1 italic">
                                "{response.expectations}"
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Detail Panel */}
              <div className="lg:col-span-1">
                <AnimatePresence mode="wait">
                  {selectedResponse ? (
                    <motion.div
                      key={selectedResponse.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="sticky top-28 bg-[#0F1729] border border-[#D4A853]/15 rounded-sm overflow-hidden"
                    >
                      {/* Detail Header */}
                      <div className="p-5 border-b border-[#D4A853]/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-[#E8E4DD]/30">
                            Response #{selectedResponse.id}
                          </span>
                          <button
                            onClick={() => setSelectedId(null)}
                            className="text-[#E8E4DD]/30 hover:text-[#D4A853] transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-[#E8E4DD]/40">
                          Submitted {new Date(selectedResponse.submittedAt).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Detail Body */}
                      <div className="p-5 space-y-4">
                        <DetailRow icon={Mail} label="Email" value={selectedResponse.email || "—"} highlight />
                        <DetailRow icon={Phone} label="Phone" value={selectedResponse.phone || "—"} highlight />
                        <div className="pt-3 border-t border-[#D4A853]/10" />
                        <DetailRow icon={Briefcase} label="Self-Employed" value={selectedResponse.selfEmployed ? "Yes" : "No"} />
                        <DetailRow icon={Building2} label="W-2 Employee" value={selectedResponse.w2Employee ? "Yes" : "No"} />
                        <DetailRow icon={DollarSign} label="Annual Income" value={`$${selectedResponse.annualIncome}`} highlight />
                        <DetailRow icon={Home} label="Owns Real Estate" value={selectedResponse.ownsRealEstate ? "Yes" : "No"} />
                        <DetailRow icon={RefreshCw} label="Roth Conversion Interest" value={selectedResponse.rothConversionInterest ? "Yes" : "No"} />
                        <DetailRow icon={PiggyBank} label="Retirement Savings" value={`$${selectedResponse.retirementSavings}`} highlight />

                        {selectedResponse.expectations && (
                          <div className="pt-3 border-t border-[#D4A853]/10">
                            <p className="text-xs uppercase tracking-wider text-[#D4A853]/60 mb-2">Expectations</p>
                            <p className="text-sm text-[#E8E4DD]/60 leading-relaxed italic">
                              "{selectedResponse.expectations}"
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        <div className="pt-3 border-t border-[#D4A853]/10">
                          <p className="text-xs uppercase tracking-wider text-[#D4A853]/60 mb-2">Notes</p>
                          {editingNotes === selectedResponse.id ? (
                            <div>
                              <textarea
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                rows={3}
                                className="w-full bg-[#0B1120] border border-[#D4A853]/20 rounded-sm py-2 px-3 text-sm text-white focus:border-[#D4A853]/50 focus:outline-none transition-colors placeholder:text-[#E8E4DD]/20 resize-none"
                                placeholder="Add notes about this prospect..."
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleSaveNotes(selectedResponse.id)}
                                  className="px-3 py-1.5 bg-[#D4A853] text-[#0B1120] text-xs font-semibold rounded-sm hover:bg-[#F0D68A] transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingNotes(null)}
                                  className="px-3 py-1.5 border border-[#D4A853]/20 text-[#E8E4DD]/50 text-xs rounded-sm hover:text-white transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingNotes(selectedResponse.id);
                                setNotesText(selectedResponse.notes ?? "");
                              }}
                              className="text-sm text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors"
                            >
                              {selectedResponse.notes || "Click to add notes..."}
                            </button>
                          )}
                        </div>

                        {/* Status Actions */}
                        <div className="pt-3 border-t border-[#D4A853]/10">
                          <p className="text-xs uppercase tracking-wider text-[#D4A853]/60 mb-3">Update Status</p>
                          <div className="flex gap-2">
                            {(["new", "reviewed", "contacted"] as StatusType[]).map((s) => {
                              const config = statusConfig[s];
                              const isActive = selectedResponse.status === s;
                              return (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(selectedResponse.id, s)}
                                  disabled={isActive}
                                  className={`flex-1 py-2 text-xs font-semibold rounded-sm border transition-all ${
                                    isActive
                                      ? `${config.bg} ${config.color}`
                                      : "border-[#D4A853]/10 text-[#E8E4DD]/40 hover:border-[#D4A853]/25 hover:text-white"
                                  }`}
                                >
                                  {config.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="sticky top-28 bg-[#0F1729]/50 border border-[#D4A853]/10 rounded-sm p-8 text-center"
                    >
                      <MessageSquare size={32} className="mx-auto text-[#D4A853]/20 mb-3" />
                      <p className="text-sm text-[#E8E4DD]/30">
                        Select a response to view details
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs text-[#E8E4DD]/40">
        <Icon size={12} className="text-[#D4A853]/50" />
        {label}
      </span>
      <span className={`text-sm font-medium ${highlight ? "text-[#D4A853]" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
