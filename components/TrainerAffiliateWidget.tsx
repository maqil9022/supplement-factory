"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_AFFILIATES } from "@/lib/supabase";
import { formatLKR } from "@/lib/utils";
import { Dumbbell, DollarSign, Wallet, ArrowRight, UserCheck } from "lucide-react";

export function TrainerAffiliateWidget() {
  const [selectedTrainer, setSelectedTrainer] = useState(MOCK_AFFILIATES[0]);
  const [testSaleAmount, setTestSaleAmount] = useState(35000);

  const discountAmount = (testSaleAmount * selectedTrainer.discount_percent) / 100;
  const netSale = testSaleAmount - discountAmount;
  const trainerCommission = (netSale * selectedTrainer.commission_rate) / 100;

  return (
    <section id="affiliates" className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 bg-black/80">
      {/* Background Gritty Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">
            <Dumbbell className="h-3.5 w-3.5" />
            Sri Lanka Coach & Athlete Network
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Trainer Affiliate <span className="text-emerald-400">Commission Engine</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400">
            Local fitness coaches earn 10% cash commission per order, while gym members unlock an instant 5% discount across all imported lab-tested supplements.
          </p>
        </div>

        {/* Live Simulator & Dashboard Preview */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Trainer Selector & Active Stats */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-3">
              Select Certified Coach Profile:
            </span>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {MOCK_AFFILIATES.map((trainer) => (
                <button
                  key={trainer.id}
                  onClick={() => setSelectedTrainer(trainer)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTrainer.id === trainer.id
                      ? "border-emerald-500 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-sm text-white">{trainer.trainer_name}</span>
                    {selectedTrainer.id === trainer.id && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{trainer.gym_name}</span>
                  <span className="font-mono text-xs font-bold text-emerald-400 mt-2 bg-black/40 px-2 py-0.5 rounded border border-zinc-800">
                    {trainer.promo_code}
                  </span>
                </button>
              ))}
            </div>

            {/* Trainer Stats Overview */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-black/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-1">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    Lifetime Earnings
                  </div>
                  <div className="text-2xl font-black text-white">
                    {formatLKR(selectedTrainer.total_earnings)}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">100% Settled Bank Transfers</span>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                    <Wallet className="h-4 w-4 text-emerald-400" />
                    Pending Payout
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatLKR(selectedTrainer.unpaid_balance)}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold">Next Payout: Friday Bank Wire</span>
                </div>
              </div>

              {/* Bank Transfer Wire Details */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 text-xs space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Registered Bank:</span>
                  <span className="font-bold text-white">{selectedTrainer.bank_name}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Account Number:</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedTrainer.bank_account_no}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Commission Math Simulator */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
              Live Checkout Breakdown Simulator
            </span>
            <h3 className="text-xl font-black uppercase text-white mb-4">
              How the Math Works at Checkout
            </h3>

            {/* Slider for test purchase */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Simulate Order Subtotal:</span>
                <span className="text-white text-sm font-black">{formatLKR(testSaleAmount)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="100000"
                step="2500"
                value={testSaleAmount}
                onChange={(e) => setTestSaleAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                <span>Rs. 10,000</span>
                <span>Rs. 50,000</span>
                <span>Rs. 100,000</span>
              </div>
            </div>

            {/* Math Breakdown Cards */}
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Client Cart Subtotal:</span>
                <span className="font-bold text-white">{formatLKR(testSaleAmount)}</span>
              </div>

              <div className="flex justify-between text-emerald-400">
                <span>
                  Client Discount ({selectedTrainer.discount_percent}% via {selectedTrainer.promo_code}):
                </span>
                <span className="font-bold">-{formatLKR(discountAmount)}</span>
              </div>

              <div className="flex justify-between border-t border-zinc-800 pt-2 text-zinc-300">
                <span>Net Order Total Paid by Customer:</span>
                <span className="font-bold text-white">{formatLKR(netSale)}</span>
              </div>

              <div className="flex justify-between items-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 mt-3">
                <div>
                  <span className="text-[11px] uppercase font-black text-emerald-400 block">
                    Coach Cash Payout ({selectedTrainer.commission_rate}% Net Sale)
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Credited into trainer dashboard upon slip approval
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-300">
                  +{formatLKR(trainerCommission)}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="#products"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors"
              >
                Use Code in Cart
                <ArrowRight className="h-3.5 w-3.5" />
              </a>

              <Link
                href="/admin"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 py-3 text-xs font-bold uppercase tracking-wider text-emerald-400 transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5" />
                View Admin Board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
