"use client";

import React from "react";
import { ShoppingCart, Clock, Send, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";

export function CustomerHowToOrder() {
  const steps = [
    {
      num: "01",
      icon: ShoppingCart,
      title: "Select & Lock Stock",
      desc: "Pick your lab-tested whey isolate, pre-workout, or creatine. When you proceed to checkout, our Available-To-Promise system locks the stock for 4 hours.",
    },
    {
      num: "02",
      icon: CreditCard,
      title: "Direct Bank Transfer",
      desc: "Transfer via online banking or CDM directly to our verified accounts at Commercial Bank, BOC, or Sampath Bank. No credit card surcharges.",
    },
    {
      num: "03",
      icon: Send,
      title: "Send WhatsApp Slip",
      desc: "The app opens a pre-formatted WhatsApp chat with your order reference. Simply send your deposit receipt image for instant verification.",
    },
    {
      num: "04",
      icon: CheckCircle2,
      title: "24-48h Delivery",
      desc: "Our Colombo warehouse team verifies the slip, permanently secures your tub, and hands over to express islandwide courier partners.",
    },
  ];

  return (
    <section id="how-to-order" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 bg-black">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">
            <Clock className="h-3.5 w-3.5" />
            Zero-Friction Bank Checkout
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            How The 4-Hour <span className="text-emerald-400">Stock Lock Works</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400">
            No payment gateway failures. No credit card convenience fees. 100% transparent direct bank transfer verified over WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-zinc-700">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
