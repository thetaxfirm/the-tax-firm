import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Upload, FileText, MessageSquare, Briefcase, ChevronRight,
  Download, Trash2, Send, Clock, CheckCircle2, AlertCircle,
  FolderOpen, Shield, LogOut, User, Bell, X, Loader2, Plus,
  FileSpreadsheet, FileImage, File as FileIcon, ArrowLeft,
} from "lucide-react";

/* ── Helper: human-readable file size ── */
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Helper: category label ── */
const categoryLabels: Record<string, string> = {
  tax_return: "Tax Return",
  w2_1099: "W-2 / 1099",
  business_docs: "Business Documents",
  financial_statement: "Financial Statement",
  receipt: "Receipt",
  contract: "Contract",
  other: "Other",
};

/* ── Helper: service type label ── */
const serviceLabels: Record<string, string> = {
  tax_strategy: "Tax Strategy & Planning",
  fractional_cfo: "Fractional CFO",
  bookkeeping: "Bookkeeping",
  roth_conversion: "Roth Conversion",
  other: "Other",
};

/* ── Helper: status badge ── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    pending_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    completed: "bg-[#D4A853]/20 text-[#D4A853] border-[#D4A853]/30",
    on_hold: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  const labels: Record<string, string> = {
    active: "Active",
    in_progress: "In Progress",
    pending_review: "Pending Review",
    completed: "Completed",
    on_hold: "On Hold",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.active}`}>
      {labels[status] || status}
    </span>
  );
}

/* ── Helper: file icon by mime type ── */
function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <FileImage size={20} className="text-purple-400" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return <FileSpreadsheet size={20} className="text-emerald-400" />;
  if (mimeType.includes("pdf")) return <FileText size={20} className="text-red-400" />;
  return <FileIcon size={20} className="text-[#D4A853]" />;
}

type Tab = "dashboard" | "documents" | "messages";

export default function Portal() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#D4A853]" />
          <p className="text-[#E8E4DD]/60 text-sm">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1120]">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container max-w-lg mx-auto">
            <div className="glass-card rounded-lg p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center mx-auto mb-6">
                <Shield size={28} className="text-[#D4A853]" />
              </div>
              <h1 className="font-serif text-3xl text-white mb-3">Client Portal</h1>
              <p className="text-[#E8E4DD]/60 mb-8 leading-relaxed">
                Access your secure client portal to upload documents, track your engagements, and communicate with our team.
              </p>
              <a
                href={getLoginUrl()}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all duration-300 tracking-wide"
              >
                <User size={18} />
                Sign In to Your Portal
              </a>
              <p className="text-[#E8E4DD]/30 text-xs mt-6">
                Don't have an account? Contact us at{" "}
                <a href="mailto:chris@thetaxfirm.us" className="text-[#D4A853] hover:underline">
                  chris@thetaxfirm.us
                </a>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <Briefcase size={18} /> },
    { id: "documents", label: "Documents", icon: <FolderOpen size={18} /> },
    { id: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container">
          {/* Portal Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl text-white mb-1">
                Welcome back, <span className="text-[#D4A853]">{user?.name?.split(" ")[0] || "Client"}</span>
              </h1>
              <p className="text-[#E8E4DD]/50 text-sm">
                Manage your documents, track engagements, and communicate with our team.
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#E8E4DD]/50 hover:text-[#D4A853] border border-[#D4A853]/20 rounded-sm hover:border-[#D4A853]/40 transition-all"
            >
              <LogOut size={14} />
              Sign Out
            </button>
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

          {/* Tab Content */}
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "messages" && <MessagesTab />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Dashboard Tab — engagement overview + quick stats
   ══════════════════════════════════════════════════════════════════ */
function DashboardTab() {
  const { data: engagements, isLoading: loadingEngagements } = trpc.engagement.myEngagements.useQuery();
  const { data: documents } = trpc.document.myDocuments.useQuery();
  const { data: unreadCount } = trpc.message.unreadCount.useQuery();

  const stats = useMemo(() => {
    const activeEngagements = engagements?.filter((e) => e.status !== "completed" && e.status !== "on_hold").length ?? 0;
    const totalDocs = documents?.length ?? 0;
    const unread = typeof unreadCount === "number" ? unreadCount : 0;
    return { activeEngagements, totalDocs, unread };
  }, [engagements, documents, unreadCount]);

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Active Engagements", value: stats.activeEngagements, icon: <Briefcase size={22} />, color: "text-emerald-400" },
          { label: "Documents", value: stats.totalDocs, icon: <FolderOpen size={22} />, color: "text-blue-400" },
          { label: "Unread Messages", value: stats.unread, icon: <Bell size={22} />, color: "text-[#D4A853]" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <span className={stat.color}>{stat.icon}</span>
              <span className="font-serif text-3xl text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-[#E8E4DD]/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Engagements */}
      <div>
        <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-[#D4A853]" />
          Your Engagements
        </h2>
        {loadingEngagements ? (
          <div className="glass-card rounded-lg p-8 text-center">
            <Loader2 size={24} className="animate-spin text-[#D4A853] mx-auto" />
          </div>
        ) : engagements && engagements.length > 0 ? (
          <div className="space-y-3">
            {engagements.map((eng) => (
              <div key={eng.id} className="glass-card rounded-lg p-5 hover:border-[#D4A853]/30 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-white font-medium mb-1">{eng.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-[#E8E4DD]/40">
                      <span>{serviceLabels[eng.serviceType] || eng.serviceType}</span>
                      <span>·</span>
                      <span>Started {new Date(eng.startDate).toLocaleDateString()}</span>
                    </div>
                    {eng.description && (
                      <p className="text-sm text-[#E8E4DD]/50 mt-2">{eng.description}</p>
                    )}
                  </div>
                  <StatusBadge status={eng.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-lg p-10 text-center">
            <Briefcase size={40} className="text-[#D4A853]/30 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No Active Engagements</h3>
            <p className="text-[#E8E4DD]/40 text-sm max-w-md mx-auto">
              Your engagements will appear here once your advisor sets up your service plan. Contact us if you have any questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Helper: format time remaining
   ══════════════════════════════════════════════════════════════════ */
function formatTimeRemaining(seconds: number): string {
  if (seconds < 1) return "less than a second";
  if (seconds < 60) return `${Math.ceil(seconds)}s remaining`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${mins}m ${secs}s remaining`;
}

/* ══════════════════════════════════════════════════════════════════
   Upload Progress State
   ══════════════════════════════════════════════════════════════════ */
type UploadFileState = {
  file: File;
  status: "pending" | "reading" | "uploading" | "done" | "error";
  progress: number; // 0-100
  error?: string;
};

/* ══════════════════════════════════════════════════════════════════
   Documents Tab — upload & manage documents
   ══════════════════════════════════════════════════════════════════ */
function DocumentsTab() {
  const utils = trpc.useUtils();
  const { data: documents, isLoading } = trpc.document.myDocuments.useQuery();
  const uploadMutation = trpc.document.upload.useMutation();

  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<string>("other");
  const [uploadNotes, setUploadNotes] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progress tracking state
  const [isUploading, setIsUploading] = useState(false);
  const [fileStates, setFileStates] = useState<UploadFileState[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null); // bytes per second
  const [bytesUploaded, setBytesUploaded] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const etaIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
    };
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFiles(Array.from(e.dataTransfer.files));
      setUploadComplete(false);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(Array.from(e.target.files));
      setUploadComplete(false);
    }
  }, []);

  const resetUploadState = () => {
    setIsUploading(false);
    setFileStates([]);
    setOverallProgress(0);
    setUploadStartTime(null);
    setEtaSeconds(null);
    setUploadSpeed(null);
    setBytesUploaded(0);
    setTotalBytes(0);
    if (etaIntervalRef.current) {
      clearInterval(etaIntervalRef.current);
      etaIntervalRef.current = null;
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    // Validate file sizes first
    const validFiles: File[] = [];
    for (const file of uploadFiles) {
      if (file.size > 16 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 16MB limit.`);
      } else {
        validFiles.push(file);
      }
    }
    if (validFiles.length === 0) return;

    // Initialize progress state
    const total = validFiles.reduce((sum, f) => sum + f.size, 0);
    setTotalBytes(total);
    setBytesUploaded(0);
    setIsUploading(true);
    setUploadComplete(false);
    setOverallProgress(0);
    setEtaSeconds(null);
    setUploadSpeed(null);

    const startTime = Date.now();
    setUploadStartTime(startTime);

    const initialStates: UploadFileState[] = validFiles.map((file) => ({
      file,
      status: "pending" as const,
      progress: 0,
    }));
    setFileStates(initialStates);

    // Start ETA update interval
    let cumulativeUploaded = 0;
    etaIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 0 && cumulativeUploaded > 0) {
        const speed = cumulativeUploaded / elapsed;
        const remaining = total - cumulativeUploaded;
        const eta = remaining / speed;
        setUploadSpeed(speed);
        setEtaSeconds(eta);
      }
    }, 500);

    let completedCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];

      // Phase 1: Reading file (simulate 0-30% of this file's progress)
      setFileStates((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "reading", progress: 5 } : s
        )
      );

      let base64: string;
      try {
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              const readPct = Math.round((e.loaded / e.total) * 30);
              setFileStates((prev) =>
                prev.map((s, idx) =>
                  idx === i ? { ...s, progress: readPct } : s
                )
              );
            }
          };
          reader.readAsDataURL(file);
        });
      } catch {
        setFileStates((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "error", progress: 0, error: "Failed to read file" } : s
          )
        );
        continue;
      }

      // Phase 2: Uploading to server (30-100% of this file's progress)
      setFileStates((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "uploading", progress: 35 } : s
        )
      );

      // Simulate smooth progress during the upload mutation
      let uploadProgressInterval: ReturnType<typeof setInterval> | null = null;
      let currentFileProgress = 35;
      uploadProgressInterval = setInterval(() => {
        currentFileProgress = Math.min(currentFileProgress + 2, 90);
        setFileStates((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, progress: currentFileProgress } : s
          )
        );
      }, 200);

      try {
        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          category: uploadCategory as any,
          notes: uploadNotes || undefined,
        });

        if (uploadProgressInterval) clearInterval(uploadProgressInterval);

        // Mark file as done
        setFileStates((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "done", progress: 100 } : s
          )
        );

        completedCount++;
        cumulativeUploaded += file.size;
        setBytesUploaded(cumulativeUploaded);

        // Update overall progress
        const overallPct = Math.round((cumulativeUploaded / total) * 100);
        setOverallProgress(overallPct);
      } catch (err: any) {
        if (uploadProgressInterval) clearInterval(uploadProgressInterval);
        setFileStates((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? { ...s, status: "error", progress: 0, error: err?.message || "Upload failed" }
              : s
          )
        );
      }
    }

    // Cleanup
    if (etaIntervalRef.current) {
      clearInterval(etaIntervalRef.current);
      etaIntervalRef.current = null;
    }

    setEtaSeconds(0);
    setOverallProgress(100);
    setUploadComplete(true);

    // Invalidate and reset after a short delay
    utils.document.myDocuments.invalidate();
    setTimeout(() => {
      setShowUpload(false);
      setUploadFiles([]);
      resetUploadState();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-white flex items-center gap-2">
          <FolderOpen size={20} className="text-[#D4A853]" />
          Your Documents
        </h2>
        <button
          onClick={() => { setShowUpload(!showUpload); if (showUpload) resetUploadState(); }}
          disabled={isUploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A853] text-[#0B1120] text-sm font-semibold rounded-sm hover:bg-[#F0D68A] transition-all disabled:opacity-50"
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <div className="glass-card rounded-lg p-6 border-[#D4A853]/20">
          {/* Drop Zone — hidden during active upload */}
          {!isUploading && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-[#D4A853] bg-[#D4A853]/5"
                  : "border-[#D4A853]/20 hover:border-[#D4A853]/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.txt"
              />
              <Upload size={32} className="text-[#D4A853]/50 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">
                {uploadFiles.length > 0
                  ? `${uploadFiles.length} file(s) selected`
                  : "Drop files here or click to browse"}
              </p>
              <p className="text-[#E8E4DD]/40 text-xs">
                PDF, DOC, XLS, CSV, JPG, PNG — Max 16MB per file
              </p>
            </div>
          )}

          {/* ── Overall Progress Bar (visible during upload) ── */}
          {isUploading && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {uploadComplete ? (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  ) : (
                    <Loader2 size={18} className="animate-spin text-[#D4A853]" />
                  )}
                  <span className="text-sm font-medium text-white">
                    {uploadComplete
                      ? "Upload Complete!"
                      : `Uploading ${fileStates.filter((f) => f.status === "done").length} of ${fileStates.length} files...`}
                  </span>
                </div>
                <span className="text-sm font-mono text-[#D4A853]">{overallProgress}%</span>
              </div>

              {/* Overall progress bar */}
              <div className="w-full h-3 bg-[#0B1120]/80 rounded-full overflow-hidden border border-[#D4A853]/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    uploadComplete
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : "bg-gradient-to-r from-[#D4A853] to-[#F0D68A]"
                  }`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              {/* ETA and speed info */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-xs text-[#E8E4DD]/40">
                  {uploadSpeed !== null && !uploadComplete && (
                    <span>{formatFileSize(Math.round(uploadSpeed))}/s</span>
                  )}
                  {bytesUploaded > 0 && (
                    <span>
                      {formatFileSize(bytesUploaded)} / {formatFileSize(totalBytes)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {!uploadComplete && etaSeconds !== null && etaSeconds > 0 ? (
                    <>
                      <Clock size={12} className="text-[#D4A853]/60" />
                      <span className="text-[#D4A853]/80 font-mono">
                        {formatTimeRemaining(etaSeconds)}
                      </span>
                    </>
                  ) : uploadComplete ? (
                    <span className="text-emerald-400">All files uploaded successfully</span>
                  ) : (
                    <>
                      <Clock size={12} className="text-[#E8E4DD]/30" />
                      <span className="text-[#E8E4DD]/30">Estimating...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* File List with per-file progress */}
          {(uploadFiles.length > 0 || fileStates.length > 0) && (
            <div className="mt-4 space-y-2">
              {(isUploading ? fileStates : uploadFiles.map((f) => ({ file: f, status: "pending" as const, progress: 0 }))).map(
                (item, i) => (
                  <div
                    key={i}
                    className={`rounded-lg overflow-hidden border transition-all ${
                      item.status === "done"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : item.status === "error"
                          ? "border-red-500/20 bg-red-500/5"
                          : "border-[#D4A853]/10 bg-[#0B1120]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.status === "done" ? (
                          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        ) : item.status === "error" ? (
                          <AlertCircle size={18} className="text-red-400 shrink-0" />
                        ) : item.status === "uploading" || item.status === "reading" ? (
                          <Loader2 size={18} className="animate-spin text-[#D4A853] shrink-0" />
                        ) : (
                          <FileTypeIcon mimeType={item.file.type} />
                        )}
                        <span className="text-sm text-white truncate max-w-[200px]">
                          {item.file.name}
                        </span>
                        <span className="text-xs text-[#E8E4DD]/40 shrink-0">
                          {formatFileSize(item.file.size)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isUploading && item.status !== "pending" && (
                          <span className="text-xs font-mono text-[#D4A853]/80 w-10 text-right">
                            {item.progress}%
                          </span>
                        )}
                        {!isUploading && (
                          <button
                            onClick={() => setUploadFiles((prev) => prev.filter((_, j) => j !== i))}
                            className="text-[#E8E4DD]/40 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Per-file progress bar */}
                    {isUploading && item.status !== "pending" && (
                      <div className="h-1 bg-[#0B1120]/60">
                        <div
                          className={`h-full transition-all duration-300 ease-out ${
                            item.status === "done"
                              ? "bg-emerald-400"
                              : item.status === "error"
                                ? "bg-red-400"
                                : "bg-[#D4A853]"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Error message */}
                    {item.status === "error" && item.error && (
                      <div className="px-3 py-1.5 text-xs text-red-400 bg-red-500/5 border-t border-red-500/10">
                        {item.error}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Category & Notes — only before upload starts */}
              {!isUploading && (
                <>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-xs text-[#E8E4DD]/50 mb-1 block">Category</label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full bg-[#0B1120]/80 border border-[#D4A853]/20 rounded px-3 py-2 text-sm text-white focus:border-[#D4A853]/50 focus:outline-none"
                      >
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#E8E4DD]/50 mb-1 block">Notes (optional)</label>
                      <input
                        type="text"
                        value={uploadNotes}
                        onChange={(e) => setUploadNotes(e.target.value)}
                        placeholder="e.g., 2024 W-2 from employer"
                        className="w-full bg-[#0B1120]/80 border border-[#D4A853]/20 rounded px-3 py-2 text-sm text-white placeholder-[#E8E4DD]/30 focus:border-[#D4A853]/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={uploadFiles.length === 0}
                    className="mt-3 flex items-center justify-center gap-2 w-full px-5 py-3 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all disabled:opacity-50"
                  >
                    <Upload size={16} />
                    Upload {uploadFiles.length} File{uploadFiles.length > 1 ? "s" : ""}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Document List */}
      {isLoading ? (
        <div className="glass-card rounded-lg p-8 text-center">
          <Loader2 size={24} className="animate-spin text-[#D4A853] mx-auto" />
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card rounded-lg p-4 hover:border-[#D4A853]/30 transition-all">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileTypeIcon mimeType={doc.mimeType} />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-[#E8E4DD]/40">
                      <span>{categoryLabels[doc.category] || doc.category}</span>
                      <span>·</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>·</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      {doc.uploadedBy === "admin" && (
                        <>
                          <span>·</span>
                          <span className="text-[#D4A853]">From The Tax Firm</span>
                        </>
                      )}
                    </div>
                    {doc.notes && (
                      <p className="text-xs text-[#E8E4DD]/30 mt-1 truncate">{doc.notes}</p>
                    )}
                  </div>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#D4A853] border border-[#D4A853]/20 rounded hover:bg-[#D4A853]/10 transition-all shrink-0"
                >
                  <Download size={12} />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-lg p-10 text-center">
          <FolderOpen size={40} className="text-[#D4A853]/30 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Documents Yet</h3>
          <p className="text-[#E8E4DD]/40 text-sm max-w-md mx-auto">
            Upload your tax documents, W-2s, 1099s, and other financial records here. Your advisor will also share documents with you through this portal.
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Messages Tab — secure messaging with the team
   ══════════════════════════════════════════════════════════════════ */
function MessagesTab() {
  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.message.myMessages.useQuery();
  const sendMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      utils.message.myMessages.invalidate();
      utils.message.unreadCount.invalidate();
      setNewMessage("");
    },
  });
  const markReadMutation = trpc.message.markRead.useMutation({
    onSuccess: () => {
      utils.message.unreadCount.invalidate();
      utils.message.myMessages.invalidate();
    },
  });

  const [newMessage, setNewMessage] = useState("");

  // Mark messages as read when tab is viewed
  const hasUnread = messages?.some((m) => m.senderRole === "admin" && !m.isRead);
  if (hasUnread) {
    markReadMutation.mutate();
  }

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMutation.mutate({ content: newMessage.trim() });
  };

  // Sort messages oldest first for chat view
  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    return [...messages].reverse();
  }, [messages]);

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl text-white flex items-center gap-2">
        <MessageSquare size={20} className="text-[#D4A853]" />
        Messages
      </h2>

      <div className="glass-card rounded-lg overflow-hidden" style={{ minHeight: "400px" }}>
        {/* Message List */}
        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-[#D4A853]" />
            </div>
          ) : sortedMessages.length > 0 ? (
            sortedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderRole === "client" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    msg.senderRole === "client"
                      ? "bg-[#D4A853]/15 border border-[#D4A853]/20"
                      : "bg-[#0F1729] border border-[#D4A853]/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      msg.senderRole === "client" ? "text-[#D4A853]" : "text-emerald-400"
                    }`}>
                      {msg.senderRole === "client" ? "You" : msg.senderName || "The Tax Firm"}
                    </span>
                    <span className="text-[10px] text-[#E8E4DD]/30">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#E8E4DD]/80 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <MessageSquare size={40} className="text-[#D4A853]/30 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No Messages Yet</h3>
              <p className="text-[#E8E4DD]/40 text-sm max-w-md mx-auto">
                Send a message to your tax advisor. We typically respond within 24 business hours.
              </p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-[#D4A853]/10 p-4">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              rows={2}
              className="flex-1 bg-[#0B1120]/80 border border-[#D4A853]/20 rounded-lg px-4 py-3 text-sm text-white placeholder-[#E8E4DD]/30 focus:border-[#D4A853]/50 focus:outline-none resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMutation.isPending}
              className="self-end px-5 py-3 bg-[#D4A853] text-[#0B1120] font-semibold rounded-sm hover:bg-[#F0D68A] transition-all disabled:opacity-50"
            >
              {sendMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-[10px] text-[#E8E4DD]/25 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
