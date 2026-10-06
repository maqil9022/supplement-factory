"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, Check, ArrowRight, Dumbbell, ShieldCheck } from "lucide-react";
import { MOCK_AFFILIATES } from "@/lib/supabase";

export function CustomerTrainerPromoBanner() {
  const [inputCode, setInputCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; name: string } | null>(null);
  const [error, setError] = useState(false);

  const handleTestCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    const found = MOCK_AFFILIATES.find((a) => a.promo_code.toUpperCase() === clean);
    if (found) {
      setApplied({ code: found.promo_code, name: found.trainer_name });
      setError(false);
    } else {
      setError(true);
      setApplied(null);
    }
  };

  return (
    <section id="trainer-promo" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 bg-zinc-950/80">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950 p-8 sm:p-12">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-emerald-400">
                <Dumbbell className="h-3.5 w-3.5" />
                Coach & Gym Partner Program
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
                Train With A Local Coach? <br />
                <span className="text-emerald-400">Unlock 5% Instant Discount</span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
                We partner with certified strength & conditioning trainers across Colombo, Kandy, Galle, and major gym chains. Ask your coach for their unique code to apply at checkout.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Valid on all imported isolates & pre-workouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Combines with free islandwide delivery</span>
                </div>
              </div>
            </div>

            {/* Right Card: Interactive Code Tester (Customer Experience) */}
            <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-2">
                Have a Trainer Code? Test It Here
              </span>

              <form onSubmit={handleTestCode} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. TRAINER-AQIL10"
                  className="flex-1 rounded-xl border border-zinc-700 bg-black/70 px-4 py-3 text-xs font-mono uppercase text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition-all cursor-pointer"
                >
                  Verify
                </button>
              </form>

              {applied ? (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-black uppercase mb-1">
                    <Check className="h-4 w-4" />
                    Verified: 5% Off Active!
                  </div>
                  <p className="text-zinc-300">
                    Coach <strong className="text-white">{applied.name}</strong>&apos;s code{" "}
                    <span className="font-mono text-emerald-300 font-bold">
                      {applied.code}
                    </span>{" "}
                    is ready to use in your cart checkout.
                  </p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
                  Code not recognized. Ask your gym coach or try sample code:{" "}
                  <span className="font-mono font-bold text-white">TRAINER-AQIL10</span>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-xs text-zinc-500">
                  Enter your trainer&apos;s referral code above to test verification before checkout.
                </div>
              )}

              <a
                href="#products"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors"
              >
                Browse Catalog & Apply Code
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
