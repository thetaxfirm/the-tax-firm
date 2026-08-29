import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users, Briefcase, FolderOpen, MessageSquare, Plus, Send,
  ChevronDown, ChevronRight, Loader2, ArrowLeft, Download,
  FileText, FileSpreadsheet, FileImage, File as FileIcon,
  CheckCircle2, Clock, AlertCircle, X,
} from "lucide-react";
import { useLocation } from "wouter";

/* ── Helpers ── */
const serviceLabels: Record<string, string> = {
  tax_strategy: "Tax Strategy & Planning",
  fractional_cfo: "Fractional CFO",
  bookkeeping: "Bookkeeping",
  roth_conversion: "Roth Conversion",
  other: "Other",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  in_progress: "In Progress",
  pending_review: "Pending Review",
  completed: "Completed",
  on_hold: "On Hold",
};

const categoryLabels: Record<string, string> = {
  tax_return: "Tax Return",
  w2_1099: "W-2 / 1099",
  business_docs: "Business Documents",
  financial_statement: "Financial Statement",
  receipt: "Receipt",
  contract: "Contract",
  other: "Other",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    pending_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    completed: "bg-[#D4A853]/20 text-[#D4A853] border-[#D4A853]/30",
    on_hold: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.active}`}>
      {statusLabels[status] || status}
    </span>
  );
}

type AdminTab = "engagements" | "documents" | "messages";

export default function AdminPortal() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("engagements");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#D4A853]" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0B1120]">
        <Navbar />
        <div className="pt-32 pb-20 container text-center">
          <h1 className="font-serif text-3xl text-white mb-4">Access Denied</h1>
          <p className="text-[#E8E4DD]/60">You do not have permission to access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "engagements", label: "Engagements", icon: <Briefcase size={18} /> },
    { id: "documents", label: "Documents", icon: <FolderOpen size={18} /> },
    { id: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/admin/responses")}
              className="text-[#E8E4DD]/40 hover:text-[#D4A853] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-serif text-3xl text-white">Portal Management</h1>
              <p className="text-[#E8E4DD]/50 text-sm">Manage client engagements, documents, and messages</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 bg-[#0F1729]/60 p-1 rounded-lg border border-[#D4A853]/10 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[#D4A853] text-[#0B1120]"
                    : "text-[#E8E4DD]/60 hover:text-[#D4A853] hover:bg-[#D4A853]/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "engagements" && <AdminEngagementsTab />}
          {activeTab === "documents" && <AdminDocumentsTab />}
          {activeTab === "messages" && <AdminMessagesTab />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Admin Engagements Tab
   ══════════════════════════════════════════════════════════════════ */
function AdminEngagementsTab() {
  const utils = trpc.useUtils();
  const { data: engagements, isLoading } = trpc.engagement.list.useQuery();
  const createMutation = trpc.engagement.create.useMutation({
    onSuccess: () => {
      utils.engagement.list.invalidate();
      setShowCreate(false);
      setNewEngagement({ userId: 0, title: "", serviceType: "tax_strategy", description: "" });
    },
  });
  const updateMutation = trpc.engagement.update.useMutation({
    onSuccess: () => utils.engagement.list.invalidate(),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [newEngagement, setNewEngagement] = useState({
    userId: 0,
    title: "",
    serviceType: "tax_strategy",
    description: "",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-white">All Engagements</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A853] text-[#0B1120] text-sm font-semibold rounded-sm hover:bg-[#F0D68A] transition-all"
        >
          <Plus size={16} />
          New Engagement
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card rounded-lg p-6 border-[#D4A853]/20">
          <h3 className="text-white font-medium mb-4">Create New Engagement</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#E8E4DD]/50 mb-1 block">Client User ID</label>
              <input
                type="number"
                value={newEngagement.userId || ""}
                onChange={(e) => setNewEngagement({ ...newEngagement, userId: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#0B1120]/80 border border-[#D4A853]/20 rounded px-3 py-2 text-sm text-white focus:border-[#D4A853]/50 focus:outline-none"
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="text-xs text-[#E8E4DD]/50 mb-1 block">Service Type</label>
              <select
                value={newEngagement.serviceType}
                onChange={(e) => setNewEngagement({ ...newEngagement, serviceType: e.target.value })}
                className="w-full bg-[#0B1120]/80 border border-[#D4A853]/20 rounded px-3 py-2 text-sm text-white focus:border-[#D4A853]/50 focus:outline-none"
              >
                {Object.entries(serviceLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-[#E8E4DD]/50 mb-1 block">Title</label>
              <input
                type="text"
                value={newEngagement.title}
                onChange={(e) => setNewEngagement({ ...newEngagement, title: e.target.value })}
                className="w-full bg-[#0B1120]/80 border border-[#D4A853]/20 rounded px-3 py-2 text-sm text-white focus:border-[#D4A853]/50 focus:outline-none"
                placeholder="e.g., 2025 Tax Strategy Engagement"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-[#E8E4DD]/50 mb-1 block">Description</label>
              <textarea
                value={newEngagement.description}
                onChange={(e) => setNewEngagement({ ...newEngagement, description: e.target.value })}
                className="w-full bg-[#0B1120]/80 border border-[#D4A853]/20 rounded px-3 py-2 text-sm text-white focus:border-[#D4A853]/50 focus:outline-none resize-none"
                rows={3}
                placeholder="Describe the engagement..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate({
                userId: newEngagement.userId,
                title: newEngagement.title,
                serviceType: newEngagement.serviceType as any,
                description: newEngagement.description || undefined,
              })}
              disabled={!newEngagement.userId || !newEngagement.title || createMutation.isPending}
              className="px-5 py-2 bg-[#D4A853] text-[#0B1120] text-sm font-semibold rounded-sm hover:bg-[#F0D68A] transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Engagement"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-5 py-2 text-sm text-[#E8E4DD]/50 border border-[#D4A853]/20 rounded-sm hover:border-[#D4A853]/40 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Engagements List */}
      {isLoading ? (
        <div className="glass-card rounded-lg p-8 text-center">
          <Loader2 size={24} className="animate-spin text-[#D4A853] mx-auto" />
        </div>
      ) : engagements && engagements.length > 0 ? (
        <div className="space-y-3">
          {engagements.map((eng) => (
            <div key={eng.id} className="glass-card rounded-lg p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium">{eng.title}</h3>
                    <span className="text-xs text-[#E8E4DD]/30">User #{eng.userId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#E8E4DD]/40">
                    <span>{serviceLabels[eng.serviceType] || eng.serviceType}</span>
                    <span>·</span>
                    <span>Started {new Date(eng.startDate).toLocaleDateString()}</span>
                  </div>
                  {eng.description && (
                    <p className="text-sm text-[#E8E4DD]/50 mt-2">{eng.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={eng.status}
                    onChange={(e) => updateMutation.mutate({ id: eng.id, status: e.target.value as any })}
                    className="bg-[#0B1120]/80 border border-[#D4A853]/20 rounded px-2 py-1 text-xs text-white focus:border-[#D4A853]/50 focus:outline-none"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <StatusBadge status={eng.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-lg p-10 text-center">
          <Briefcase size={40} className="text-[#D4A853]/30 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Engagements</h3>
          <p className="text-[#E8E4DD]/40 text-sm">Create an engagement to get started.</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Admin Documents Tab
   ══════════════════════════════════════════════════════════════════ */
function AdminDocumentsTab() {
  const utils = trpc.useUtils();
  const { data: documents, isLoading } = trpc.document.list.useQuery();
  const deleteMutation = trpc.document.delete.useMutation({
    onSuccess: () => utils.document.list.invalidate(),
  });

  /**
   * The stored fileUrl is a presigned URL that expires, so it must not be used
   * as a permanent href — ask the server for a fresh one at click time. The
   * server also re-checks that this document belongs to the caller.
   *
   * The tab is opened synchronously, before the await, so the click still
   * counts as the user gesture that lets it through the popup blocker.
   */
  const handleDownload = async (documentId: number) => {
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    try {
      const { url } = await utils.document.getDownloadUrl.fetch({ documentId });
      if (tab) tab.location.replace(url);
      else window.location.href = url;
    } catch {
      tab?.close();
      alert("Could not open that document. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl text-white">All Client Documents</h2>

      {isLoading ? (
        <div className="glass-card rounded-lg p-8 text-center">
          <Loader2 size={24} className="animate-spin text-[#D4A853] mx-auto" />
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={20} className="text-[#D4A853] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-[#E8E4DD]/40">
                      <span>User #{doc.userId}</span>
                      <span>·</span>
                      <span>{categoryLabels[doc.category] || doc.category}</span>
                      <span>·</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>·</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className={doc.uploadedBy === "admin" ? "text-emerald-400" : "text-blue-400"}>
                        {doc.uploadedBy === "admin" ? "Admin" : "Client"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(doc.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#D4A853] border border-[#D4A853]/20 rounded hover:bg-[#D4A853]/10 transition-all"
                  >
                    <Download size={12} />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this document?")) {
                        deleteMutation.mutate({ id: doc.id });
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 border border-red-400/20 rounded hover:bg-red-400/10 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-lg p-10 text-center">
          <FolderOpen size={40} className="text-[#D4A853]/30 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Documents</h3>
          <p className="text-[#E8E4DD]/40 text-sm">Client documents will appear here.</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Admin Messages Tab
   ══════════════════════════════════════════════════════════════════ */
function AdminMessagesTab() {
  const utils = trpc.useUtils();
  const { data: allMessages, isLoading } = trpc.message.list.useQuery();
  const replyMutation = trpc.message.adminReply.useMutation({
    onSuccess: () => {
      utils.message.list.invalidate();
      setReplyText("");
      setReplyingTo(null);
    },
  });

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // Group messages by userId
  type MsgType = NonNullable<typeof allMessages>[number];
  const messagesByUser = useMemo(() => {
    if (!allMessages) return new Map<number, MsgType[]>();
    const map = new Map<number, MsgType[]>();
    for (const msg of allMessages) {
      const existing = map.get(msg.userId) || [];
      existing.push(msg);
      map.set(msg.userId, existing);
    }
    return map;
  }, [allMessages]);

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl text-white">All Messages</h2>

      {isLoading ? (
        <div className="glass-card rounded-lg p-8 text-center">
          <Loader2 size={24} className="animate-spin text-[#D4A853] mx-auto" />
        </div>
      ) : messagesByUser.size > 0 ? (
        <div className="space-y-4">
          {Array.from(messagesByUser).map(([userId, msgs]) => {
            const latestMsg = msgs[0]; // already sorted desc
            const clientName = msgs.find((m: MsgType) => m.senderRole === "client")?.senderName || `User #${userId}`;
            const unreadCount = msgs.filter((m: MsgType) => m.senderRole === "client" && !m.isRead).length;

            return (
              <div key={userId} className="glass-card rounded-lg overflow-hidden">
                {/* Conversation Header */}
                <div className="p-4 border-b border-[#D4A853]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center">
                      <span className="text-[#D4A853] text-xs font-bold">
                        {clientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-white text-sm font-medium">{clientName}</span>
                      <span className="text-[#E8E4DD]/30 text-xs ml-2">User #{userId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-[#D4A853] text-[#0B1120] text-xs font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                    <span className="text-xs text-[#E8E4DD]/30">
                      {new Date(latestMsg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Recent Messages */}
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {[...msgs].reverse().map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          msg.senderRole === "admin"
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : "bg-[#0B1120]/60 border border-[#D4A853]/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${
                            msg.senderRole === "admin" ? "text-emerald-400" : "text-[#D4A853]"
                          }`}>
                            {msg.senderRole === "admin" ? "You" : msg.senderName || "Client"}
                          </span>
                          <span className="text-[10px] text-[#E8E4DD]/30">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-[#E8E4DD]/80 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="border-t border-[#D4A853]/10 p-3">
                  {replyingTo === userId ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && replyText.trim()) {
                            replyMutation.mutate({ userId, content: replyText.trim() });
                          }
                        }}
                        placeholder="Type your reply..."
                        className="flex-1 bg-[#0B1120]/80 border border-[#D4A853]/20 rounded px-3 py-2 text-sm text-white placeholder-[#E8E4DD]/30 focus:border-[#D4A853]/50 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (replyText.trim()) {
                            replyMutation.mutate({ userId, content: replyText.trim() });
                          }
                        }}
                        disabled={!replyText.trim() || replyMutation.isPending}
                        className="px-4 py-2 bg-[#D4A853] text-[#0B1120] text-sm font-semibold rounded-sm hover:bg-[#F0D68A] transition-all disabled:opacity-50"
                      >
                        {replyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="px-3 py-2 text-sm text-[#E8E4DD]/40 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(userId)}
                      className="flex items-center gap-2 text-sm text-[#D4A853] hover:text-[#F0D68A] transition-colors"
                    >
                      <Send size={14} />
                      Reply to {clientName}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-lg p-10 text-center">
          <MessageSquare size={40} className="text-[#D4A853]/30 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Messages</h3>
          <p className="text-[#E8E4DD]/40 text-sm">Client messages will appear here.</p>
        </div>
      )}
    </div>
  );
}
