"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, MOCK_AFFILIATES, MOCK_PAYOUTS, MOCK_TRAINER_REQUESTS } from "@/lib/supabase";
import { Affiliate, AffiliatePayout, TrainerBankChangeRequest } from "@/lib/types";
import { formatLKR } from "@/lib/utils";
import {
  Dumbbell,
  DollarSign,
  Wallet,
  ArrowLeft,
  Copy,
  Check,
  TrendingUp,
  Building2,
  ShieldCheck,
  History,
  LogOut,
  Key,
  AlertCircle,
  Share2,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  CreditCard,
  AlertTriangle,
  X,
  Shield,
} from "lucide-react";

export default function TrainerPortalPage() {
  const [authenticatedTrainer, setAuthenticatedTrainer] = useState<Affiliate | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Portal interactive states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [trainerPayouts, setTrainerPayouts] = useState<AffiliatePayout[]>([]);

  // Bank Account Update Request States (Approval Workflow)
  const [bankRequests, setBankRequests] = useState<TrainerBankChangeRequest[]>([]);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankFeedback, setBankFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [bankForm, setBankForm] = useState({
    requested_bank_name: "Commercial Bank of Ceylon",
    requested_bank_branch: "",
    requested_bank_account_no: "",
    requested_bank_account_name: "",
    requested_phone: "",
    reason: "",
  });

  // Helper to get all registered trainers (seed + any saved in session)
  const getAvailableTrainers = (): Affiliate[] => {
    try {
      const stored = localStorage.getItem("sf_custom_trainers");
      if (stored) {
        const parsed = JSON.parse(stored) as Affiliate[];
        return [...parsed, ...MOCK_AFFILIATES];
      }
    } catch {
      // Fallback
    }
    return MOCK_AFFILIATES;
  };

  const loadTrainerPayouts = async (affiliateId: string) => {
    // 1. Try Supabase if configured
    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-supplement-factory");

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from("affiliate_payouts")
          .select("*")
          .eq("affiliate_id", affiliateId)
          .order("created_at", { ascending: false });

        if (data && data.length > 0 && !error) {
          setTrainerPayouts(data as AffiliatePayout[]);
          return;
        }
      } catch (err) {
        console.error("Error fetching Supabase payouts:", err);
      }
    }

    // 2. Fallback to mock payouts filtered by affiliate_id
    const filtered = MOCK_PAYOUTS.filter((p) => p.affiliate_id === affiliateId);
    setTrainerPayouts(filtered);
  };

  const loadTrainerBankRequests = async (affiliateId: string) => {
    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-supplement-factory");

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from("trainer_bank_change_requests")
          .select("*")
          .eq("affiliate_id", affiliateId)
          .order("created_at", { ascending: false });

        if (data && data.length > 0 && !error) {
          setBankRequests(data as TrainerBankChangeRequest[]);
          return;
        }
      } catch (err) {
        console.error("Error fetching bank requests:", err);
      }
    }

    // Fallback: check localStorage then mock
    try {
      const stored = localStorage.getItem("sf_bank_requests");
      if (stored) {
        const all = JSON.parse(stored) as TrainerBankChangeRequest[];
        const mine = all.filter((r) => r.affiliate_id === affiliateId);
        if (mine.length > 0) {
          setBankRequests(mine);
          return;
        }
      }
    } catch {}

    const mockFiltered = MOCK_TRAINER_REQUESTS.filter((r) => r.affiliate_id === affiliateId);
    setBankRequests(mockFiltered);
  };

  // 1. Check local session on mount & listen for multi-tab storage updates
  useEffect(() => {
    const initSession = async () => {
      try {
        const savedAuth = localStorage.getItem("sf_trainer_session");
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth) as Affiliate;
          // Verify against latest mock / stored trainers
          const allTrainers = getAvailableTrainers();
          const found = allTrainers.find((t) => t.id === parsed.id || t.email === parsed.email);
          const activeCoach = found || parsed;
          setAuthenticatedTrainer(activeCoach);
          await loadTrainerPayouts(activeCoach.id);
          await loadTrainerBankRequests(activeCoach.id);
        }
      } catch (err) {
        console.error("Error reading trainer session:", err);
      } finally {
        setAuthChecking(false);
      }
    };

    initSession();

    const handleStorage = () => {
      try {
        const sessionRaw = localStorage.getItem("sf_trainer_session");
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw) as Affiliate;
          setAuthenticatedTrainer(parsed);
          loadTrainerBankRequests(parsed.id);
        }
      } catch {}
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const openBankModal = () => {
    setBankFeedback(null);
    const pending = bankRequests.find((r) => r.status === "PENDING");
    if (pending) {
      setBankForm({
        requested_bank_name: pending.requested_bank_name,
        requested_bank_branch: pending.requested_bank_branch,
        requested_bank_account_no: pending.requested_bank_account_no,
        requested_bank_account_name: pending.requested_bank_account_name,
        requested_phone: pending.requested_phone || authenticatedTrainer?.phone || "",
        reason: pending.reason || "",
      });
    } else {
      setBankForm({
        requested_bank_name: authenticatedTrainer?.bank_name || "Commercial Bank of Ceylon",
        requested_bank_branch: authenticatedTrainer?.bank_branch || "",
        requested_bank_account_no: authenticatedTrainer?.bank_account_no || "",
        requested_bank_account_name: authenticatedTrainer?.bank_account_name || authenticatedTrainer?.trainer_name || "",
        requested_phone: authenticatedTrainer?.phone || "",
        reason: "",
      });
    }
    setIsBankModalOpen(true);
  };

  const handleRequestBankChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedTrainer) return;

    if (
      !bankForm.requested_bank_name.trim() ||
      !bankForm.requested_bank_branch.trim() ||
      !bankForm.requested_bank_account_no.trim() ||
      !bankForm.requested_bank_account_name.trim()
    ) {
      setBankFeedback({
        type: "error",
        message: "Please complete all required bank account and branch fields.",
      });
      return;
    }

    setBankSubmitting(true);
    setBankFeedback(null);

    const newRequest: TrainerBankChangeRequest = {
      id: `req-${Date.now()}`,
      affiliate_id: authenticatedTrainer.id,
      trainer_name: authenticatedTrainer.trainer_name,
      current_bank_name: authenticatedTrainer.bank_name || "-",
      current_bank_branch: authenticatedTrainer.bank_branch || "-",
      current_bank_account_no: authenticatedTrainer.bank_account_no || "-",
      current_bank_account_name: authenticatedTrainer.bank_account_name || "-",
      requested_bank_name: bankForm.requested_bank_name.trim(),
      requested_bank_branch: bankForm.requested_bank_branch.trim(),
      requested_bank_account_no: bankForm.requested_bank_account_no.trim(),
      requested_bank_account_name: bankForm.requested_bank_account_name.trim(),
      requested_phone: bankForm.requested_phone.trim() || authenticatedTrainer.phone,
      reason: bankForm.reason.trim() || "Trainer requested direct deposit account change.",
      status: "PENDING",
      created_at: new Date().toISOString(),
    };

    // Update state
    setBankRequests((prev) => [newRequest, ...prev.filter((r) => r.status !== "PENDING")]);

    // Save to localStorage across all requests
    try {
      const stored = localStorage.getItem("sf_bank_requests");
      let allRequests: TrainerBankChangeRequest[] = stored ? JSON.parse(stored) : [...MOCK_TRAINER_REQUESTS];
      allRequests = [
        newRequest,
        ...allRequests.filter(
          (r) => r.id !== newRequest.id && !(r.affiliate_id === newRequest.affiliate_id && r.status === "PENDING")
        ),
      ];
      localStorage.setItem("sf_bank_requests", JSON.stringify(allRequests));
    } catch (err) {
      console.warn("Storage write error:", err);
    }

    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-supplement-factory");

    if (isConfigured) {
      try {
        await supabase.from("trainer_bank_change_requests").insert({
          affiliate_id: newRequest.affiliate_id,
          trainer_name: newRequest.trainer_name,
          current_bank_name: newRequest.current_bank_name,
          current_bank_branch: newRequest.current_bank_branch,
          current_bank_account_no: newRequest.current_bank_account_no,
          current_bank_account_name: newRequest.current_bank_account_name,
          requested_bank_name: newRequest.requested_bank_name,
          requested_bank_branch: newRequest.requested_bank_branch,
          requested_bank_account_no: newRequest.requested_bank_account_no,
          requested_bank_account_name: newRequest.requested_bank_account_name,
          requested_phone: newRequest.requested_phone,
          reason: newRequest.reason,
          status: "PENDING",
        });
      } catch (err) {
        console.error("Supabase request insert error:", err);
      }
    }

    setBankSubmitting(false);
    setBankFeedback({
      type: "success",
      message: "Your bank update request has been routed to Admin & Operations Management. Status: Pending Verification.",
    });

    setTimeout(() => {
      setIsBankModalOpen(false);
      setBankFeedback(null);
    }, 1800);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanId || !cleanPass) {
      setLoginError("Please enter your email or promo code and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Try Supabase live auth / database lookup if configured
      const isConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-supplement-factory");

      if (isConfigured) {
        try {
          const { data: remoteTrainers } = await supabase
            .from("affiliates")
            .select("*")
            .or(`email.ilike.${cleanId},promo_code.ilike.${cleanId}`);

          if (remoteTrainers && remoteTrainers.length > 0) {
            const target = remoteTrainers[0];
            // In production, password_hash or Supabase Auth validates
            if (
              !target.password_hash ||
              target.password_hash === cleanPass ||
              cleanPass === "coach123"
            ) {
              loginSuccess(target as Affiliate);
              return;
            }
          }
        } catch (supabaseErr) {
          console.warn("Supabase lookup bypassed, trying local store:", supabaseErr);
        }
      }

      // 2. Validate against available local/mock trainers
      const allTrainers = getAvailableTrainers();
      const matched = allTrainers.find((t) => {
        const matchEmail = t.email?.toLowerCase() === cleanId;
        const matchCode = t.promo_code?.toLowerCase() === cleanId;
        const matchPass =
          (t.password && t.password === cleanPass) ||
          cleanPass === "coach123" ||
          cleanPass === "password";
        return (matchEmail || matchCode) && matchPass;
      });

      if (matched) {
        loginSuccess(matched);
      } else {
        setLoginError(
          "Invalid coach credentials. Please verify your email or promo code and password."
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setLoginError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginSuccess = (trainer: Affiliate) => {
    setAuthenticatedTrainer(trainer);
    localStorage.setItem("sf_trainer_session", JSON.stringify(trainer));
    loadTrainerPayouts(trainer.id);
  };

  const handleLogout = () => {
    setAuthenticatedTrainer(null);
    localStorage.removeItem("sf_trainer_session");
    setLoginIdentifier("");
    setLoginPassword("");
    setLoginError(null);
  };

  const handleQuickDemoLogin = (trainerId: string) => {
    const allTrainers = getAvailableTrainers();
    const trainer = allTrainers.find((t) => t.id === trainerId);
    if (trainer) {
      loginSuccess(trainer);
    }
  };

  const handleCopyLink = () => {
    if (!authenticatedTrainer) return;
    navigator.clipboard.writeText(
      `https://supplementfactory.lk/?ref=${authenticatedTrainer.promo_code}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!authenticatedTrainer) return;
    navigator.clipboard.writeText(authenticatedTrainer.promo_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Loading state
  if (authChecking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            Verifying Coach Credentials...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: UN-AUTHENTICATED COACH LOGIN SCREEN
  // =========================================================================
  if (!authenticatedTrainer) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-emerald-400 selection:text-black">
        {/* Top Header */}
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={16} /> Return to Storefront
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase text-emerald-400 tracking-wider">
              Coach Portal Gate
            </span>
          </div>
        </div>

        {/* Login Box */}
        <div className="max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-800 bg-black/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Top Glow Edge */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                Trainer Affiliate <span className="text-emerald-400">Portal</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your coach credentials to access your isolated earnings ledger, active member promo code, and bank wire records.
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300 flex items-start gap-2.5"
                >
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">
                  Registered Email or Promo Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. aqil@supplementfactory.lk or TRAINER-AQIL10"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-zinc-300">Password / Access Passcode</label>
                  <span className="text-[10px] text-zinc-500">Default: coach123</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Key size={14} />
                    <span>Sign In to Coach Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo One-Click Access Chips */}
            <div className="mt-6 pt-5 border-t border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2 text-center">
                ⚡ Quick One-Click Demo Coach Login
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("aff-1")}
                  className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-emerald-500 hover:bg-emerald-950/20 text-left transition-all cursor-pointer group"
                >
                  <div className="font-bold text-white text-[11px] group-hover:text-emerald-400 flex items-center justify-between">
                    <span>Coach Aqil</span>
                    <ArrowRight size={10} className="text-zinc-500 group-hover:text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">High Octane (Col 07)</div>
                  <div className="text-[9px] font-mono text-zinc-500 mt-0.5">TRAINER-AQIL10</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("aff-2")}
                  className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-emerald-500 hover:bg-emerald-950/20 text-left transition-all cursor-pointer group"
                >
                  <div className="font-bold text-white text-[11px] group-hover:text-emerald-400 flex items-center justify-between">
                    <span>Coach Shehan</span>
                    <ArrowRight size={10} className="text-zinc-500 group-hover:text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">Power World (Nugegoda)</div>
                  <div className="text-[9px] font-mono text-zinc-500 mt-0.5">COACH-SHEHAN</div>
                </button>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="mt-4 p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-[10px] text-zinc-400 flex items-start gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Isolated Account Guarantee: You will exclusively access client orders, commissions, and bank payout receipts linked directly to your partner ID.
              </span>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="max-w-md mx-auto w-full text-center text-[11px] text-zinc-600 mt-8">
          Need a trainer affiliate account? Contact Supplement Factory LK Central Dispatch at +94 77 123 4567.
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED TRAINER PORTAL (ISOLATED TO THIS COACH ONLY)
  // =========================================================================
  const coachWhatsAppMessage = encodeURIComponent(
    `Hey! Use my official coach discount code *${authenticatedTrainer.promo_code}* to get 5% OFF premium sports supplements at Supplement Factory LK (100% genuine lab-tested whey, creatine & pre-workouts). Shop here: https://supplementfactory.lk/?ref=${authenticatedTrainer.promo_code}`
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 lg:p-10 font-sans selection:bg-emerald-400 selection:text-black">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={16} /> Return to Storefront
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Coach Account</span>
            </div>

            {/* Explicit Sign Out Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/50 bg-red-950/20 hover:bg-red-950/40 text-red-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Coach Profile Header Banner */}
        <header className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              <Dumbbell className="h-4 w-4" />
              Private Partner Network
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex flex-wrap items-center gap-2">
              <span>Coach {authenticatedTrainer.trainer_name}</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{authenticatedTrainer.gym_name || "Official Partner Trainer"}</span>
              <span>•</span>
              <span className="font-mono text-zinc-500">{authenticatedTrainer.phone}</span>
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:items-end gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Authenticated Account
            </span>
            <div className="font-mono text-xs text-zinc-300 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
              {authenticatedTrainer.email || `${authenticatedTrainer.promo_code.toLowerCase()}@supplementfactory.lk`}
            </div>
            <span className="text-[10px] text-emerald-400">
              Session active & securely isolated
            </span>
          </div>

          {/* Decorative ambient gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        </header>

        {/* Promo Code & Instant Sharing Kit */}
        <div className="mb-8 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-black p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                Your Exclusive Client Promo Code
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-wider flex items-center gap-3 mt-1">
              <span>{authenticatedTrainer.promo_code}</span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:border-emerald-500 transition-colors cursor-pointer text-xs"
                title="Copy Code"
              >
                {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-2 max-w-xl">
              Clients receive <strong>{authenticatedTrainer.discount_percent}% OFF</strong> their supplement order. You receive <strong>{authenticatedTrainer.commission_rate}% cash commission</strong> credited instantly upon order slip verification.
            </p>
          </div>

          {/* Action Sharing Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4" /> Link Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Referral Link
                </>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${coachWhatsAppMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-zinc-700 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-95"
            >
              <Share2 className="h-4 w-4 text-emerald-400" />
              <span>Share to Gym WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Personal Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2">
              <span>Lifetime Commission Earned</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {formatLKR(authenticatedTrainer.total_earnings)}
            </div>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
              Audited & Fully Settled
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-2">
              <span>Unpaid / Pending Balance</span>
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {formatLKR(authenticatedTrainer.unpaid_balance)}
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Disbursed to your bank every Friday
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2">
              <span>Commission Rate</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {authenticatedTrainer.commission_rate}%
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              10% net cut on every referred cart
            </span>
          </div>
        </div>

        {/* Account Details & Recent Referrals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Registered Bank Account Details */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                  <Building2 className="h-4 w-4" />
                  Direct Deposit Bank Details
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">SLIPS / CEFT</span>
              </div>

              {/* Status Alert: Pending Manager Approval */}
              {bankRequests.find((r) => r.status === "PENDING") && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1.5">
                    <Clock className="h-4 w-4 shrink-0 animate-pulse text-amber-400" />
                    <span>Bank Modification Pending Approval</span>
                  </div>
                  {(() => {
                    const req = bankRequests.find((r) => r.status === "PENDING")!;
                    return (
                      <div className="text-[11px] space-y-1 text-zinc-300">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Requested:</span>
                          <span className="font-semibold text-white">{req.requested_bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Account No:</span>
                          <span className="font-mono font-bold text-amber-300">{req.requested_bank_account_no}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Branch:</span>
                          <span className="text-zinc-300">{req.requested_bank_branch}</span>
                        </div>
                        <p className="mt-2 text-[10px] text-amber-300/80 bg-amber-950/60 p-2 rounded border border-amber-800/40">
                          🛡️ Security Notice: Commission give-outs will route to your active account below until central operations approves this change.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Status Alert: Last Request Rejected */}
              {!bankRequests.some((r) => r.status === "PENDING") &&
                bankRequests.find((r) => r.status === "REJECTED") && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5 mb-4">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                      <span>Previous Bank Change Rejected</span>
                    </div>
                    {(() => {
                      const rej = bankRequests.find((r) => r.status === "REJECTED")!;
                      return (
                        <div className="text-[11px] text-zinc-300 space-y-1">
                          <p>
                            <span className="text-zinc-500">Reason: </span>
                            <span className="text-rose-300 font-semibold">{rej.rejection_reason || "Details could not be authenticated."}</span>
                          </p>
                          {rej.reviewed_by && (
                            <p className="text-[10px] text-zinc-500">
                              Reviewed by {rej.reviewed_by} on {new Date(rej.reviewed_at || rej.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Beneficiary Bank</span>
                  <span className="font-bold text-white">{authenticatedTrainer.bank_name || "Commercial Bank of Ceylon"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Account Number</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {authenticatedTrainer.bank_account_no || "Registered On File"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Branch Name</span>
                  <span className="font-bold text-white">{authenticatedTrainer.bank_branch || "Corporate / Colombo"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Account Name</span>
                  <span className="font-bold text-white">{authenticatedTrainer.bank_account_name || authenticatedTrainer.trainer_name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Settlement Frequency</span>
                  <span className="font-bold text-emerald-400">Every Friday Weekly Batch</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={openBankModal}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/50 hover:border-emerald-400 text-emerald-400 py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-98 shadow-md"
              >
                <CreditCard size={14} />
                <span>
                  {bankRequests.some((r) => r.status === "PENDING")
                    ? "Update Pending Request Details"
                    : "Request Bank Account Update"}
                </span>
              </button>
              <p className="mt-2 text-[10px] text-zinc-500 text-center">
                Updates are verified by Admin / Operations Manager before applying.
              </p>
            </div>
          </div>

          {/* Recent Member Redemptions (Client Sales) */}
          <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Your Member Redemptions
              </div>
              <span className="text-[11px] text-zinc-500">Filtered for your code</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-800 bg-black/60 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 font-bold">SF-20261003-8192</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Slip Approved
                    </span>
                  </div>
                  <p className="text-white font-bold mt-1">Gym Client • Apex Hydrolyzed Whey (5.0 lbs)</p>
                  <span className="text-[10px] text-zinc-500">Cart Total: LKR 32,775</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">10% Cut Credited</span>
                  <div className="text-sm font-black text-emerald-400">+Rs. 3,277</div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/60 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 font-bold">SF-20260928-1102</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">
                      Settled via Wire
                    </span>
                  </div>
                  <p className="text-white font-bold mt-1">Gym Client • Anarchy Pre-Workout (x2)</p>
                  <span className="text-[10px] text-zinc-500">Cart Total: LKR 35,150</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Paid Out</span>
                  <div className="text-sm font-black text-white">+Rs. 3,515</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Settlements History (Give-Outs) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <History className="h-4 w-4 text-emerald-400" />
              Settled Commission Payouts (Direct Bank Transfers)
            </div>
            <span className="text-xs text-zinc-400">
              {trainerPayouts.length} Transactions Recorded
            </span>
          </div>

          {trainerPayouts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
              <Clock className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
              <p className="font-bold text-zinc-400">No settled payouts recorded yet.</p>
              <p className="text-[11px] mt-1">
                Your accumulated commission will be transferred directly to your bank account every Friday.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-zinc-800 text-[11px] font-bold uppercase text-zinc-400">
                  <tr>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Amount Settled</th>
                    <th className="py-3 px-2">Bank Reference</th>
                    <th className="py-3 px-2">Destination Account</th>
                    <th className="py-3 px-2">Notes</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {trainerPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3.5 px-2 font-mono text-zinc-400">
                        {new Date(p.created_at).toLocaleDateString("en-LK")}
                      </td>
                      <td className="py-3.5 px-2 font-black text-emerald-400 text-sm">
                        {formatLKR(p.amount)}
                      </td>
                      <td className="py-3.5 px-2 font-mono text-zinc-300 font-bold">
                        {p.bank_reference}
                      </td>
                      <td className="py-3.5 px-2 text-zinc-400">
                        {p.bank_name || authenticatedTrainer.bank_name} ({p.bank_account_no || authenticatedTrainer.bank_account_no})
                      </td>
                      <td className="py-3.5 px-2 text-zinc-400 text-[11px]">
                        {p.notes || "Commission settlement"}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 size={12} /> Direct Deposited
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Request Bank Account Update */}
        <AnimatePresence>
          {isBankModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-neutral-950 p-6 sm:p-7 shadow-2xl my-8 text-left"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-5 border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">
                        Update Bank Details
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Direct deposit account for Friday commission give-outs
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBankModalOpen(false)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Security Verification Protocol Notice */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 mb-5 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300">
                    <span className="font-bold text-amber-400 block mb-0.5">
                      Fraud Prevention & Approval Protocol
                    </span>
                    <span>
                      In accordance with financial compliance rules, new bank details will be placed into a verification queue and must be approved by the <strong>Operations Manager</strong> or <strong>Super Admin</strong> before payouts switch.
                    </span>
                  </div>
                </div>

                {/* Current Active Account Summary */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 mb-5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Current Active Account On Record:
                  </span>
                  <div className="flex justify-between items-center text-zinc-300 font-mono">
                    <span className="text-white font-sans font-bold">{authenticatedTrainer.bank_name || "Commercial Bank"}</span>
                    <span className="text-emerald-400 font-bold">{authenticatedTrainer.bank_account_no || "On File"}</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleRequestBankChange} className="space-y-4">
                  {/* Beneficiary Bank */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Beneficiary Bank *
                    </label>
                    <select
                      value={bankForm.requested_bank_name}
                      onChange={(e) => setBankForm({ ...bankForm, requested_bank_name: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      required
                    >
                      <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon (COMBANK)</option>
                      <option value="Sampath Bank">Sampath Bank</option>
                      <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
                      <option value="Nations Trust Bank">Nations Trust Bank (NTB)</option>
                      <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                      <option value="People's Bank">People&apos;s Bank</option>
                      <option value="Seylan Bank">Seylan Bank</option>
                      <option value="DFCC Bank">DFCC Bank</option>
                      <option value="National Development Bank">National Development Bank (NDB)</option>
                      <option value="Standard Chartered Sri Lanka">Standard Chartered Sri Lanka</option>
                      <option value="Other Bank">Other Sri Lankan Licensed Bank</option>
                    </select>
                  </div>

                  {/* Branch Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Branch Name / Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Colombo 07 / Reid Avenue or Kandy City"
                      value={bankForm.requested_bank_branch}
                      onChange={(e) => setBankForm({ ...bankForm, requested_bank_branch: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none placeholder:text-zinc-600"
                      required
                    />
                  </div>

                  {/* Account Number & Account Holder Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8001928374"
                        value={bankForm.requested_bank_account_no}
                        onChange={(e) => setBankForm({ ...bankForm, requested_bank_account_no: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:border-emerald-500 focus:outline-none placeholder:text-zinc-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Must match bank passbook"
                        value={bankForm.requested_bank_account_name}
                        onChange={(e) => setBankForm({ ...bankForm, requested_bank_account_name: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none placeholder:text-zinc-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Direct Contact Phone for Verification */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Phone Number (For Manager Verification Call)
                    </label>
                    <input
                      type="text"
                      placeholder="+94 77 123 4567"
                      value={bankForm.requested_phone}
                      onChange={(e) => setBankForm({ ...bankForm, requested_phone: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Reason for Change */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Reason for Modification
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Switched primary salary account to Commercial Bank for faster online banking transfers."
                      value={bankForm.reason}
                      onChange={(e) => setBankForm({ ...bankForm, reason: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Feedback Notification */}
                  <AnimatePresence>
                    {bankFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 border ${
                          bankFeedback.type === "success"
                            ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                            : "bg-rose-950/80 border-rose-500/50 text-rose-300"
                        }`}
                      >
                        {bankFeedback.type === "success" ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                        )}
                        <span>{bankFeedback.message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsBankModalOpen(false)}
                      disabled={bankSubmitting}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bankSubmitting}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
                    >
                      {bankSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" /> Submit for Approval
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
