"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Affiliate,
  AffiliatePayout,
  CreateTrainerInput,
  UpdateTrainerInput,
  ProcessPayoutInput,
} from "@/lib/types";
import { formatLKR } from "@/lib/utils";
import {
  Dumbbell,
  UserPlus,
  Wallet,
  Building2,
  DollarSign,
  Copy,
  Check,
  Send,
  X,
  CreditCard,
  History,
  CheckCircle2,
  AlertCircle,
  Phone,
  Edit3,
  Lock,
  Key,
  ShieldAlert,
  UserCheck,
  UserX,
} from "lucide-react";

interface AdminTrainerManagerProps {
  trainers: Affiliate[];
  payouts: AffiliatePayout[];
  onAddTrainer: (trainer: CreateTrainerInput) => void;
  onEditTrainer: (trainer: UpdateTrainerInput) => void;
  onProcessPayout: (input: ProcessPayoutInput) => void;
}

const SRI_LANKA_BANKS = [
  "Commercial Bank of Ceylon",
  "Bank of Ceylon (BOC)",
  "Sampath Bank",
  "Hatton National Bank (HNB)",
  "Seylan Bank",
  "Nations Trust Bank (NTB)",
  "DFCC Bank",
  "Pan Asia Bank",
  "Union Bank",
];

export function AdminTrainerManager({
  trainers,
  payouts,
  onAddTrainer,
  onEditTrainer,
  onProcessPayout,
}: AdminTrainerManagerProps) {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrainerForPayout, setSelectedTrainerForPayout] = useState<Affiliate | null>(null);
  const [activeTab, setActiveTab] = useState<"trainers" | "payouts">("trainers");

  // Edit Trainer Form State
  const [editTrainer, setEditTrainer] = useState<UpdateTrainerInput>({
    id: "",
    trainer_name: "",
    email: "",
    password: "",
    gym_name: "",
    promo_code: "",
    discount_percent: 5,
    commission_rate: 10,
    phone: "",
    bank_name: "Commercial Bank of Ceylon",
    bank_branch: "",
    bank_account_no: "",
    bank_account_name: "",
    is_active: true,
  });

  // New Trainer Form State
  const [newTrainer, setNewTrainer] = useState<CreateTrainerInput>({
    trainer_name: "",
    email: "",
    password: "",
    gym_name: "",
    promo_code: "",
    discount_percent: 5,
    commission_rate: 10,
    phone: "",
    bank_name: "Commercial Bank of Ceylon",
    bank_branch: "",
    bank_account_no: "",
    bank_account_name: "",
  });

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [bankRef, setBankRef] = useState<string>("");
  const [payoutNotes, setPayoutNotes] = useState<string>("");
  const [lastWhatsAppRemittanceUrl, setLastWhatsAppRemittanceUrl] = useState<string | null>(null);

  // Copy states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGeneratePromoCode = () => {
    if (!newTrainer.trainer_name) return;
    const clean = newTrainer.trainer_name
      .trim()
      .split(" ")[0]
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const emailPrefix = clean.toLowerCase();
    setNewTrainer((prev) => ({
      ...prev,
      promo_code: `TRAINER-${clean}10`,
      email: prev.email || `${emailPrefix}@supplementfactory.lk`,
      password: prev.password || "coach123",
    }));
  };

  const handleSubmitNewTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainer.trainer_name || !newTrainer.promo_code || !newTrainer.phone) {
      alert("Please fill in trainer name, promo code, and phone number.");
      return;
    }
    onAddTrainer({
      ...newTrainer,
      email: newTrainer.email || `${newTrainer.trainer_name.toLowerCase().replace(/[^a-z0-9]/g, "")}@supplementfactory.lk`,
      password: newTrainer.password || "coach123",
    });
    setIsAddModalOpen(false);
    setNewTrainer({
      trainer_name: "",
      email: "",
      password: "",
      gym_name: "",
      promo_code: "",
      discount_percent: 5,
      commission_rate: 10,
      phone: "",
      bank_name: "Commercial Bank of Ceylon",
      bank_branch: "",
      bank_account_no: "",
      bank_account_name: "",
    });
  };

  const handleOpenEdit = (trainer: Affiliate) => {
    setEditTrainer({
      id: trainer.id,
      trainer_name: trainer.trainer_name,
      email: trainer.email || `${trainer.promo_code.toLowerCase().replace(/[^a-z0-9]/g, "")}@supplementfactory.lk`,
      password: trainer.password || "coach123",
      gym_name: trainer.gym_name || "",
      promo_code: trainer.promo_code,
      discount_percent: trainer.discount_percent,
      commission_rate: trainer.commission_rate,
      phone: trainer.phone || "",
      bank_name: trainer.bank_name || "Commercial Bank of Ceylon",
      bank_branch: trainer.bank_branch || "",
      bank_account_no: trainer.bank_account_no || "",
      bank_account_name: trainer.bank_account_name || trainer.trainer_name,
      is_active: trainer.is_active !== false,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitEditTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTrainer.trainer_name || !editTrainer.promo_code || !editTrainer.phone) {
      alert("Please fill in trainer name, promo code, and phone number.");
      return;
    }
    onEditTrainer({
      ...editTrainer,
      promo_code: editTrainer.promo_code.toUpperCase().trim(),
    });
    setIsEditModalOpen(false);
  };

  const handleOpenPayout = (trainer: Affiliate) => {
    setSelectedTrainerForPayout(trainer);
    setPayoutAmount(trainer.unpaid_balance);
    setBankRef(`WIRE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`);
    setPayoutNotes(`Commission settlement ${new Date().toLocaleDateString("en-LK")}`);
    setLastWhatsAppRemittanceUrl(null);
  };

  const handleSubmitPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainerForPayout || payoutAmount <= 0) return;

    if (payoutAmount > selectedTrainerForPayout.unpaid_balance) {
      alert("Payout amount cannot exceed the trainer's unpaid balance.");
      return;
    }

    onProcessPayout({
      affiliate_id: selectedTrainerForPayout.id,
      amount: payoutAmount,
      bank_reference: bankRef,
      notes: payoutNotes,
    });

    // Generate WhatsApp Remittance receipt text to send directly to trainer
    const phoneClean = selectedTrainerForPayout.phone.replace(/[^0-9]/g, "");
    const remittanceMsg = `*SUPPLEMENT FACTORY SRI LANKA - COMMISSION REMITTANCE*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear Coach *${selectedTrainerForPayout.trainer_name}*,

Your affiliate commission payout has been successfully transferred to your bank account!

💰 *Amount Transferred:* ${formatLKR(payoutAmount)}
🏦 *Bank:* ${selectedTrainerForPayout.bank_name || "Commercial Bank"}
📄 *Account Number:* ${selectedTrainerForPayout.bank_account_no || "On File"}
🔖 *Bank Reference:* *${bankRef}*
📅 *Date:* ${new Date().toLocaleDateString("en-LK")}

_Thank you for partnering with Supplement Factory Sri Lanka!_`;

    const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(remittanceMsg)}`;
    setLastWhatsAppRemittanceUrl(waUrl);
  };

  const totalOutstandingBalance = trainers.reduce((sum, t) => sum + t.unpaid_balance, 0);
  const totalLifetimePaid = payouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Controls & KPI Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-orange-500" />
            Trainer Affiliate Engine
          </h2>
          <p className="text-xs text-neutral-400">
            Recruit gym coaches, assign discount codes, and disburse weekly commission payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tab view switcher */}
          <div className="flex rounded-lg border border-neutral-800 bg-neutral-900 p-1">
            <button
              onClick={() => setActiveTab("trainers")}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                activeTab === "trainers"
                  ? "bg-orange-500 text-black font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Active Trainers ({trainers.length})
            </button>
            <button
              onClick={() => setActiveTab("payouts")}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                activeTab === "payouts"
                  ? "bg-orange-500 text-black font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Payout History ({payouts.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-95"
          >
            <UserPlus size={16} />
            Add Trainer
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Total Outstanding Payouts
          </span>
          <div className="text-3xl font-black text-orange-400">
            {formatLKR(totalOutstandingBalance)}
          </div>
          <span className="text-[11px] text-neutral-500">Unsettled Commissions Waiting For Wire</span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Total Lifetime Settled
          </span>
          <div className="text-3xl font-black text-emerald-400">
            {formatLKR(totalLifetimePaid)}
          </div>
          <span className="text-[11px] text-neutral-500">Bank Direct Deposits Disbursed</span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Registered Coach Network
          </span>
          <div className="text-3xl font-black text-white">{trainers.length} Coaches</div>
          <span className="text-[11px] text-neutral-500">Colombo, Kandy & Partner Gyms</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TRAINERS DIRECTORY TABLE */}
      {/* ========================================================================= */}
      {activeTab === "trainers" && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-[11px] font-black uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="p-4">Trainer & Gym</th>
                <th className="p-4">Promo Code</th>
                <th className="p-4">Split (Client / Coach)</th>
                <th className="p-4">Bank Details On File</th>
                <th className="p-4">Lifetime Earned</th>
                <th className="p-4">Unpaid Balance</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {trainers.map((trainer) => (
                <tr key={trainer.id} className="hover:bg-neutral-900/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="font-black text-white text-sm">{trainer.trainer_name}</div>
                      {trainer.is_active === false ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          Inactive
                        </span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Active Partner" />
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400">{trainer.gym_name || "Independent"}</div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{trainer.phone}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                      <span className="text-neutral-500 font-sans">Login:</span>
                      <span>{trainer.email || `${trainer.promo_code.toLowerCase()}@supplementfactory.lk`}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleCopyCode(trainer.promo_code)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-black/60 px-2.5 py-1 font-mono font-bold text-orange-400 hover:border-orange-500 transition-colors cursor-pointer"
                    >
                      <span>{trainer.promo_code}</span>
                      {copiedCode === trainer.promo_code ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} className="text-neutral-500" />
                      )}
                    </button>
                  </td>

                  <td className="p-4 font-mono">
                    <span className="text-emerald-400 font-bold">{trainer.discount_percent}% Off</span> /{" "}
                    <span className="text-orange-400 font-bold">{trainer.commission_rate}% Comm</span>
                  </td>

                  <td className="p-4">
                    <div className="text-white font-medium">{trainer.bank_name || "Not set"}</div>
                    <div className="font-mono text-neutral-400 text-[11px]">
                      {trainer.bank_account_no || "-"}
                    </div>
                    {trainer.bank_branch && (
                      <div className="text-[10px] text-neutral-500">{trainer.bank_branch}</div>
                    )}
                  </td>

                  <td className="p-4 font-black text-white">
                    {formatLKR(trainer.total_earnings)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                        trainer.unpaid_balance > 0
                          ? "bg-orange-500/10 border border-orange-500/40 text-orange-400"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {formatLKR(trainer.unpaid_balance)}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(trainer)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:border-orange-500 hover:bg-neutral-700 px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer group shadow-sm"
                        title="Edit Coach Profile, Commission Rates & Bank Info"
                      >
                        <Edit3 size={13} className="text-orange-400 group-hover:scale-110 transition-transform" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleOpenPayout(trainer)}
                        disabled={trainer.unpaid_balance <= 0}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          trainer.unpaid_balance > 0
                            ? "bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-95"
                            : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                        }`}
                      >
                        <Wallet size={14} />
                        Settle Payout
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PAYOUTS AUDIT HISTORY TABLE */}
      {/* ========================================================================= */}
      {activeTab === "payouts" && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-[11px] font-black uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Trainer</th>
                <th className="p-4">Amount Disbursed</th>
                <th className="p-4">Bank & Account</th>
                <th className="p-4">Bank Reference</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    No payouts recorded yet.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-900/80 transition-colors">
                    <td className="p-4 font-mono text-neutral-400">
                      {new Date(p.created_at).toLocaleDateString("en-LK")}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {p.trainer_name || "Trainer"}
                    </td>
                    <td className="p-4 font-black text-emerald-400 text-sm">
                      {formatLKR(p.amount)}
                    </td>
                    <td className="p-4">
                      <div className="text-white">{p.bank_name || "Commercial Bank"}</div>
                      <div className="font-mono text-neutral-400 text-[11px]">
                        {p.bank_account_no}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-orange-400 font-bold">
                      {p.bank_reference}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                        <Check size={12} /> Settled
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: REGISTER NEW TRAINER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-black uppercase text-white">
                    Register New Coach / Trainer
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitNewTrainer} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-400">Trainer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newTrainer.trainer_name}
                      onChange={(e) =>
                        setNewTrainer({ ...newTrainer, trainer_name: e.target.value })
                      }
                      placeholder="e.g. Kasun Fernando"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400">Gym / Fitness Center</label>
                    <input
                      type="text"
                      value={newTrainer.gym_name}
                      onChange={(e) =>
                        setNewTrainer({ ...newTrainer, gym_name: e.target.value })
                      }
                      placeholder="e.g. High Octane Colombo 07"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Promo Code with Auto-Generator */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-neutral-400">Unique Promo Code *</label>
                    <button
                      type="button"
                      onClick={handleGeneratePromoCode}
                      className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      ⚡ Auto-Generate From Name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newTrainer.promo_code}
                    onChange={(e) =>
                      setNewTrainer({ ...newTrainer, promo_code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. TRAINER-KASUN10"
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 font-mono uppercase text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Discount & Commission Percentages */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-400">Customer Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={newTrainer.discount_percent}
                      onChange={(e) =>
                        setNewTrainer({ ...newTrainer, discount_percent: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400">Trainer Commission (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={newTrainer.commission_rate}
                      onChange={(e) =>
                        setNewTrainer({ ...newTrainer, commission_rate: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-400">WhatsApp Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newTrainer.phone}
                    onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                    placeholder="+94771234567"
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Coach Portal Login Credentials */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-emerald-400 block">
                      Coach Portal Login Account
                    </span>
                    <span className="text-[10px] text-neutral-400">Used by trainer at /trainer</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-400 text-[11px]">Portal Login Email *</label>
                      <input
                        type="email"
                        required
                        value={newTrainer.email}
                        onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                        placeholder="coach@supplementfactory.lk"
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-400 text-[11px]">Password / Passcode *</label>
                      <input
                        type="text"
                        required
                        value={newTrainer.password}
                        onChange={(e) => setNewTrainer({ ...newTrainer, password: e.target.value })}
                        placeholder="e.g. coach123"
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 font-mono text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="border-t border-neutral-800 pt-4 space-y-3">
                  <span className="text-[11px] font-black uppercase text-orange-400 block">
                    Direct Payout Bank Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-400">Bank Name</label>
                      <select
                        value={newTrainer.bank_name}
                        onChange={(e) =>
                          setNewTrainer({ ...newTrainer, bank_name: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                      >
                        {SRI_LANKA_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-neutral-400">Branch Name</label>
                      <input
                        type="text"
                        value={newTrainer.bank_branch}
                        onChange={(e) =>
                          setNewTrainer({ ...newTrainer, bank_branch: e.target.value })
                        }
                        placeholder="e.g. Kollupitiya"
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-400">Account Number</label>
                      <input
                        type="text"
                        value={newTrainer.bank_account_no}
                        onChange={(e) =>
                          setNewTrainer({ ...newTrainer, bank_account_no: e.target.value })
                        }
                        placeholder="e.g. 8001928374"
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 font-mono text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-400">Account Holder Name</label>
                      <input
                        type="text"
                        value={newTrainer.bank_account_name}
                        onChange={(e) =>
                          setNewTrainer({ ...newTrainer, bank_account_name: e.target.value })
                        }
                        placeholder="e.g. K S Fernando"
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 rounded-xl bg-orange-500 hover:bg-orange-400 py-3 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer"
                >
                  Confirm & Activate Trainer Code
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. MODAL: PROCESS / SETTLE PAYOUT (GIVE OUT) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedTrainerForPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrainerForPayout(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-black uppercase text-white">
                    Settle Trainer Commission Payout
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTrainerForPayout(null)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {lastWhatsAppRemittanceUrl ? (
                /* Post-payout WhatsApp confirmation */
                <div className="py-4 text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-black uppercase text-white">
                    Payout Successfully Recorded!
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    The trainer&apos;s unpaid balance has been deducted. You can now send an automated remittance receipt via WhatsApp.
                  </p>

                  <a
                    href={lastWhatsAppRemittanceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                  >
                    <Send size={16} />
                    Send Remittance WhatsApp To Coach
                  </a>

                  <button
                    onClick={() => setSelectedTrainerForPayout(null)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Done & Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayout} className="space-y-4 text-xs">
                  {/* Coach & Bank Card */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-white text-base block">
                          {selectedTrainerForPayout.trainer_name}
                        </span>
                        <span className="text-neutral-400 font-mono">
                          {selectedTrainerForPayout.promo_code}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-neutral-500">
                          Unpaid Balance
                        </span>
                        <div className="text-xl font-black text-orange-400">
                          {formatLKR(selectedTrainerForPayout.unpaid_balance)}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-2 text-[11px] text-neutral-400 space-y-1">
                      <div>
                        Bank: <strong className="text-white">{selectedTrainerForPayout.bank_name || "Commercial Bank"}</strong>
                      </div>
                      <div>
                        Account Number:{" "}
                        <strong className="font-mono text-emerald-300">
                          {selectedTrainerForPayout.bank_account_no || "Not on file"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Payment Inputs */}
                  <div>
                    <label className="font-bold text-neutral-400">Payout Amount (LKR) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedTrainerForPayout.unpaid_balance}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white font-mono text-base font-bold focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400">Bank Transfer Reference *</label>
                    <input
                      type="text"
                      required
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="e.g. COMBANK-FT-991204"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400">Notes / Period</label>
                    <input
                      type="text"
                      value={payoutNotes}
                      onChange={(e) => setPayoutNotes(e.target.value)}
                      placeholder="e.g. September Week 4 commission"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 py-3 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    Confirm Payment & Deduct Balance
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT CURRENT TRAINER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl my-8 text-left"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-white tracking-tight">
                      Edit Coach Profile & Terms
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Update coach identity, discount code, commission percentage, and bank account.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitEditTrainer} className="space-y-5 text-xs">
                {/* Section 1: Coach Personal & Contact Details */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block border-b border-neutral-800 pb-1">
                    1. Personal & Contact Information
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-neutral-300">Trainer Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editTrainer.trainer_name}
                        onChange={(e) => setEditTrainer({ ...editTrainer, trainer_name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white font-bold focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-300">Gym / Training Facility *</label>
                      <input
                        type="text"
                        required
                        value={editTrainer.gym_name}
                        onChange={(e) => setEditTrainer({ ...editTrainer, gym_name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-neutral-300">WhatsApp / Contact Phone *</label>
                      <input
                        type="text"
                        required
                        value={editTrainer.phone}
                        onChange={(e) => setEditTrainer({ ...editTrainer, phone: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white font-mono focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-300">Partner Account Status</label>
                      <div className="mt-1 flex items-center gap-3 h-10 px-3 rounded-lg border border-neutral-800 bg-neutral-900">
                        <label className="flex items-center gap-2 cursor-pointer text-white">
                          <input
                            type="checkbox"
                            checked={editTrainer.is_active}
                            onChange={(e) => setEditTrainer({ ...editTrainer, is_active: e.target.checked })}
                            className="rounded border-neutral-700 bg-neutral-950 text-orange-500 focus:ring-orange-500 h-4 w-4"
                          />
                          <span className="font-bold text-xs">
                            {editTrainer.is_active ? "Active Partner (Can login & earn)" : "Suspended / Inactive"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Portal Login Credentials */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block border-b border-neutral-800 pb-1">
                    2. Coach Portal Login Credentials
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-neutral-300">Login Email / Identifier</label>
                      <input
                        type="email"
                        value={editTrainer.email}
                        onChange={(e) => setEditTrainer({ ...editTrainer, email: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white font-mono focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-300">Portal Password</label>
                      <input
                        type="text"
                        value={editTrainer.password}
                        onChange={(e) => setEditTrainer({ ...editTrainer, password: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white font-mono focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Commercial Promo & Commission Terms */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block border-b border-neutral-800 pb-1">
                    3. Promo Code & Commission Split
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-neutral-300">Promo Code *</label>
                      <input
                        type="text"
                        required
                        value={editTrainer.promo_code}
                        onChange={(e) => setEditTrainer({ ...editTrainer, promo_code: e.target.value.toUpperCase() })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-orange-400 font-mono font-bold uppercase focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-300">Client Discount (%) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="50"
                        value={editTrainer.discount_percent}
                        onChange={(e) => setEditTrainer({ ...editTrainer, discount_percent: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-emerald-400 font-bold focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-300">Coach Commission (%) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="50"
                        value={editTrainer.commission_rate}
                        onChange={(e) => setEditTrainer({ ...editTrainer, commission_rate: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-orange-400 font-bold focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Direct Deposit Bank Account */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block border-b border-neutral-800 pb-1">
                    4. Bank Account for Commission Give-Outs
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-neutral-300">Bank Name</label>
                      <select
                        value={editTrainer.bank_name}
                        onChange={(e) => setEditTrainer({ ...editTrainer, bank_name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                      >
                        {SRI_LANKA_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-neutral-300">Branch Name</label>
                      <input
                        type="text"
                        value={editTrainer.bank_branch}
                        onChange={(e) => setEditTrainer({ ...editTrainer, bank_branch: e.target.value })}
                        placeholder="e.g. Kollupitiya / Colombo 07"
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-neutral-300">Account Number</label>
                      <input
                        type="text"
                        value={editTrainer.bank_account_no}
                        onChange={(e) => setEditTrainer({ ...editTrainer, bank_account_no: e.target.value })}
                        placeholder="e.g. 8001928374"
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white font-mono focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-300">Account Holder Name</label>
                      <input
                        type="text"
                        value={editTrainer.bank_account_name}
                        onChange={(e) => setEditTrainer({ ...editTrainer, bank_account_name: e.target.value })}
                        placeholder="Name as registered with bank"
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.35)] active:scale-95"
                  >
                    <Check size={16} />
                    Save Trainer Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
