"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem, CustomerDetails } from "@/lib/types";
import { formatLKR, generateOrderNumber, generateOrderExpiryTime } from "@/lib/utils";
import { generateWhatsAppCheckoutUrl } from "@/lib/whatsapp";
import { MOCK_AFFILIATES } from "@/lib/supabase";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export function CheckoutDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CheckoutDrawerProps) {
  // Form State
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Colombo",
    district: "Colombo",
  });

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Totals Calculation
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const matchedAffiliate = MOCK_AFFILIATES.find(
    (a) => a.promo_code.toLowerCase() === appliedPromo?.toLowerCase()
  );

  const discountPercent = matchedAffiliate ? matchedAffiliate.discount_percent : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const deliveryFee = subtotal > 50000 ? 0 : 500; // Free delivery over Rs. 50,000
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleCopyAccount = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("8009218274");
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) return;

    const found = MOCK_AFFILIATES.find(
      (a) => a.promo_code.toUpperCase() === clean
    );

    if (found) {
      setAppliedPromo(found.promo_code);
      setPromoError(null);
    } else {
      setPromoError("Invalid trainer promo code. Try: TRAINER-AQIL10");
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      alert("Please fill in your Name, Phone Number, and Delivery Address.");
      return;
    }

    const orderNumber = generateOrderNumber();
    const expiresAt = generateOrderExpiryTime(4);

    const whatsappUrl = generateWhatsAppCheckoutUrl({
      orderNumber,
      customer,
      items: cart,
      subtotal,
      discount: discountAmount,
      total: totalAmount,
      promoCode: appliedPromo || undefined,
      expiresAt,
    });

    setLastWhatsAppUrl(whatsappUrl);
    setIsSubmitted(true);

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Drawer Window (Full width on mobile, responsive padding) */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 220 }}
          className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-zinc-800 bg-zinc-950 p-4 sm:p-6 text-white shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 sm:pb-4 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                  Frictionless Checkout
                </h2>
                <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                  ATP 4H LOCK
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Bank Transfer & WhatsApp Instant Slip Approval
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Checkout Drawer"
              className="flex items-center justify-center min-h-[48px] min-w-[48px] rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer touch-manipulation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isSubmitted ? (
            /* ========================================================================= */
            /* Post-Submission WhatsApp Screen (Sticky Bank Card & Action) */
            /* ========================================================================= */
            <div className="my-auto flex flex-col items-center text-center py-6">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-3 animate-bounce">
                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Stock Reserved For 4 Hours!
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 max-w-xs leading-normal">
                Your order is locked. Transfer via online banking or CDM and send the deposit slip to WhatsApp.
              </p>

              {/* High-Visibility Bank Transfer Box with 1-Tap Copy */}
              <div className="mt-5 w-full rounded-2xl border-2 border-emerald-500/50 bg-zinc-900/90 p-4 text-left shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                    <Building2 className="h-4 w-4" />
                    Commercial Bank of Ceylon
                  </div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                    Official Hub Account
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Account Name:</span>
                    <strong className="text-white font-mono">SUPPLEMENT FACTORY LK</strong>
                  </div>

                  <div className="flex justify-between items-center bg-black/60 p-2.5 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Account Number</span>
                      <span className="font-mono font-black text-emerald-300 text-base tracking-wider">
                        8009218274
                      </span>
                    </div>

                    <button
                      onClick={handleCopyAccount}
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold transition-colors touch-manipulation cursor-pointer"
                    >
                      {copiedAccount ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-zinc-800/80">
                    <span className="text-zinc-400 font-bold">Total Amount Due:</span>
                    <span className="font-mono font-black text-white text-base text-emerald-400">
                      {formatLKR(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {lastWhatsAppUrl && (
                <a
                  href={lastWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 min-h-[50px] py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] touch-manipulation cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Open WhatsApp Chat & Send Slip
                </a>
              )}

              <button
                onClick={() => {
                  onClearCart();
                  setIsSubmitted(false);
                  onClose();
                }}
                className="mt-3 flex items-center justify-center min-h-[48px] text-xs font-bold text-zinc-400 hover:text-white transition-colors touch-manipulation w-full"
              >
                Close & Return to Store
              </button>
            </div>
          ) : cart.length === 0 ? (
            /* ========================================================================= */
            /* Empty Cart */
            /* ========================================================================= */
            <div className="my-auto flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 mb-3">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <p className="text-base font-bold text-zinc-300">Your cart is empty</p>
              <p className="text-xs text-zinc-500 max-w-xs mt-1">
                Select your lab-tested supplements from the catalog to lock available inventory.
              </p>
              <button
                onClick={onClose}
                className="mt-6 flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-black uppercase tracking-wider text-white transition-colors touch-manipulation cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            /* ========================================================================= */
            /* Active Cart & Checkout Form */
            /* ========================================================================= */
            <div className="flex flex-col gap-5 py-3 flex-1">
              {/* 4-Hour Stock Lock Notice */}
              <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  Items in cart will be held for <strong className="text-white">4 hours</strong> upon order creation while you transfer funds.
                </span>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block">
                  Selected Items ({cart.length})
                </span>

                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
                  >
                    <div className="relative h-14 w-14 shrink-0 rounded bg-black/60 p-1">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        {item.product.flavor || "Formula"} • {formatLKR(item.product.price)}
                      </p>
                    </div>

                    {/* Quantity Controls (Minimum 40px touch buttons) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center border border-zinc-800 rounded-lg bg-black/60">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="flex items-center justify-center min-h-[40px] min-w-[36px] text-zinc-400 hover:text-emerald-400 active:text-emerald-400 transition-colors touch-manipulation cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2 text-xs font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="flex items-center justify-center min-h-[40px] min-w-[36px] text-zinc-400 hover:text-emerald-400 active:text-emerald-400 transition-colors touch-manipulation cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        aria-label="Remove item"
                        className="flex items-center justify-center min-h-[40px] min-w-[36px] text-zinc-500 hover:text-red-400 active:text-red-400 transition-colors touch-manipulation cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trainer Promo Code Field */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 mb-2">
                  <Tag className="h-3.5 w-3.5 text-emerald-400" />
                  Local Gym Trainer Promo Code
                </span>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="e.g. TRAINER-AQIL10"
                    className="flex-1 rounded-xl border border-zinc-700 bg-black/60 px-3.5 min-h-[48px] text-base sm:text-xs font-mono uppercase text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 px-5 min-h-[48px] text-xs font-black uppercase text-white transition-colors cursor-pointer touch-manipulation shrink-0"
                  >
                    Apply
                  </button>
                </form>

                {appliedPromo && matchedAffiliate && (
                  <div className="mt-2 flex items-center justify-between text-xs text-emerald-400">
                    <span>
                      ✓ {matchedAffiliate.trainer_name}&apos;s Code Applied!
                    </span>
                    <span className="font-bold">5% OFF</span>
                  </div>
                )}

                {promoError && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{promoError}</span>
                  </div>
                )}
              </div>

              {/* Delivery Details Form */}
              <form onSubmit={handleCheckout} className="space-y-3.5">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                  Recipient Details (Sri Lanka)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                      placeholder="e.g. Kamal Perera"
                      className="w-full rounded-xl border border-zinc-700 bg-black/60 px-3.5 min-h-[48px] text-base sm:text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      WhatsApp Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                      placeholder="0771234567"
                      className="w-full rounded-xl border border-zinc-700 bg-black/60 px-3.5 min-h-[48px] text-base sm:text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    placeholder="Street Address, Apt / Unit"
                    className="w-full rounded-xl border border-zinc-700 bg-black/60 px-3.5 min-h-[48px] text-base sm:text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      City / Area
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) =>
                        setCustomer({ ...customer, city: e.target.value })
                      }
                      placeholder="Colombo 03"
                      className="w-full rounded-xl border border-zinc-700 bg-black/60 px-3.5 min-h-[48px] text-base sm:text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      District
                    </label>
                    <select
                      value={customer.district}
                      onChange={(e) =>
                        setCustomer({ ...customer, district: e.target.value })
                      }
                      className="w-full rounded-xl border border-zinc-700 bg-black/60 px-3.5 min-h-[48px] text-base sm:text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Other">Other District</option>
                    </select>
                  </div>
                </div>

                {/* Direct Bank Transfer Notice (Always Visible) */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-[11px] text-zinc-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Commercial Bank • A/C <strong>8009218274</strong></span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Zero Fee</span>
                </div>

                {/* Sticky Bottom Summary & Primary Action Bar */}
                <div className="sticky bottom-0 z-20 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 mt-4 border-t border-zinc-800 bg-zinc-950/98 backdrop-blur-xl p-4 sm:p-5 shadow-[0_-12px_30px_rgba(0,0,0,0.9)]">
                  {/* Pricing Breakdown mini */}
                  <div className="flex justify-between items-baseline mb-2.5">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-zinc-400 block">
                        Total Amount Due
                      </span>
                      {discountAmount > 0 && (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          Includes 5% Coach Discount (-{formatLKR(discountAmount)})
                        </span>
                      )}
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                      {formatLKR(totalAmount)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 min-h-[50px] py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer active:scale-98 touch-manipulation"
                  >
                    <Send className="h-4 w-4" />
                    Lock 4-Hour Stock & Send Slip on WhatsApp
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
