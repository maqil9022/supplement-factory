"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Order, OrderStatus } from "@/lib/types";
import { formatLKR } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  Truck,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Eye,
  AlertTriangle,
} from "lucide-react";

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: "ord-101",
    order_number: "SF-20261003-8192",
    customer_details: {
      name: "Dinesh Weerasinghe",
      phone: "+94773821092",
      address: "14/2 Inner Flower Road",
      city: "Colombo 07",
      district: "Colombo",
    },
    subtotal: 34500,
    discount_amount: 1725,
    delivery_fee: 0,
    total_amount: 32775,
    status: "awaiting_payment",
    payment_method: "bank_transfer_whatsapp",
    applied_promo_code: "TRAINER-AQIL10",
    affiliate_id: "aff-1",
    affiliate_commission_amount: 3277,
    expires_at: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-102",
    order_number: "SF-20261003-4512",
    customer_details: {
      name: "Kasun Senanayake",
      phone: "+94719827411",
      address: "98 Peradeniya Road",
      city: "Kandy",
      district: "Kandy",
    },
    subtotal: 18500,
    discount_amount: 925,
    delivery_fee: 500,
    total_amount: 18075,
    status: "confirmed",
    payment_method: "bank_transfer_whatsapp",
    applied_promo_code: "COACH-SHEHAN",
    affiliate_id: "aff-2",
    affiliate_commission_amount: 1757,
    expires_at: new Date().toISOString(),
    confirmed_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-103",
    order_number: "SF-20261002-9901",
    customer_details: {
      name: "Roshan Mendis",
      phone: "+94762341982",
      address: "55 Matara Road",
      city: "Galle",
      district: "Galle",
    },
    subtotal: 49000,
    discount_amount: 0,
    delivery_fee: 0,
    total_amount: 49000,
    status: "shipped",
    payment_method: "bank_transfer_whatsapp",
    affiliate_commission_amount: 0,
    expires_at: new Date().toISOString(),
    confirmed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    shipped_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

export function AdminKanbanPreview() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_DEMO_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderStatus>("awaiting_payment");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprovePayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: "confirmed",
            confirmed_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    showToast(
      "Payment Verified! Stock permanently deducted and Trainer Commission credited to pending payout."
    );
  };

  const handleDispatchOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: "shipped",
            shipped_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    showToast("Order dispatched via Koombiyo / Pronto Islandwide Logistics!");
  };

  const awaitingOrders = orders.filter((o) => o.status === "awaiting_payment");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const shippedOrders = orders.filter((o) => o.status === "shipped");

  return (
    <section id="admin" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 bg-zinc-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">
              <Zap className="h-3.5 w-3.5" />
              Supabase Real-Time Order Stream
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Warehouse & Admin <span className="text-emerald-400">Order Kanban</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              One-click WhatsApp slip verification, atomic inventory settlement, and automated affiliate payout recording.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
              Real-time Subscribed
            </span>
          </div>
        </div>

        {/* Live Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/60 bg-emerald-950/80 p-4 text-xs font-bold text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Awaiting Payment */}
          <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <h3 className="font-black text-sm uppercase text-white tracking-wide">
                  Awaiting Bank Slip
                </h3>
              </div>
              <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs font-black text-amber-400">
                {awaitingOrders.length}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {awaitingOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No orders currently awaiting slip verification.
                </div>
              ) : (
                awaitingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-amber-500/30 bg-black/70 p-4 transition-all hover:border-amber-500/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {order.order_number}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded">
                        <Clock className="h-3 w-3" /> 4h Lock Active
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-zinc-300">
                      <p className="font-black text-white">{order.customer_details.name}</p>
                      <p className="text-zinc-400">{order.customer_details.city} • {order.customer_details.phone}</p>
                      <p className="font-bold text-emerald-400 pt-1">
                        Total: {formatLKR(order.total_amount)}
                      </p>
                      {order.applied_promo_code && (
                        <p className="text-[11px] text-zinc-400">
                          Trainer: <span className="text-emerald-300 font-bold">{order.applied_promo_code}</span> (+{formatLKR(order.affiliate_commission_amount)} comm)
                        </p>
                      )}
                    </div>

                    {/* Action: Approve Payment */}
                    <button
                      onClick={() => handleApprovePayment(order.id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Slip & Deduct Stock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Confirmed / Ready to Ship */}
          <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="font-black text-sm uppercase text-white tracking-wide">
                  Confirmed / Packed
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs font-black text-emerald-400">
                {confirmedOrders.length}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {confirmedOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No orders waiting for courier pickup.
                </div>
              ) : (
                confirmedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-emerald-500/30 bg-black/70 p-4 transition-all hover:border-emerald-500/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {order.order_number}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">
                        Payment Verified
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-zinc-300">
                      <p className="font-black text-white">{order.customer_details.name}</p>
                      <p className="text-zinc-400">{order.customer_details.address}, {order.customer_details.city}</p>
                      <p className="font-bold text-emerald-400 pt-1">
                        Paid: {formatLKR(order.total_amount)}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Inventory physically deducted from central Colombo warehouse
                      </p>
                    </div>

                    {/* Action: Dispatch */}
                    <button
                      onClick={() => handleDispatchOrder(order.id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors cursor-pointer"
                    >
                      <Truck className="h-4 w-4 text-emerald-400" />
                      Dispatch with Courier
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Shipped / Dispatched */}
          <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-sky-400" />
                <h3 className="font-black text-sm uppercase text-white tracking-wide">
                  Shipped / In Transit
                </h3>
              </div>
              <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 text-xs font-black text-sky-400">
                {shippedOrders.length}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {shippedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-zinc-800 bg-black/50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      {order.order_number}
                    </span>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded">
                      In Transit
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-zinc-300">
                    <p className="font-black text-white">{order.customer_details.name}</p>
                    <p className="text-zinc-400">{order.customer_details.city} ({order.customer_details.district})</p>
                    <p className="text-zinc-400 pt-1">
                      Tracking: <span className="font-mono text-zinc-300">KB-LK982187</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
