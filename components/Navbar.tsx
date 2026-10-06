"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ShoppingBag,
  ShieldCheck,
  HelpCircle,
  Tag,
  Sparkles,
  Menu,
  X,
  Dumbbell,
  Lock,
  ArrowRight,
} from "lucide-react";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function Navbar({ cartCount, onOpenCart }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
        {/* Top Ticker Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-zinc-900 to-emerald-600 px-3 py-1.5 text-center text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-zinc-100 flex items-center justify-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 truncate">
            <Zap className="h-3 w-3 text-emerald-400 fill-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate">ISLANDWIDE 24-48H DISPATCH</span>
            <span className="hidden xs:inline text-zinc-400">(COLOMBO / KANDY / GALLE)</span>
          </span>
          <span className="hidden md:inline text-zinc-500">•</span>
          <span className="hidden md:inline text-emerald-300">
            WHATSAPP BANK TRANSFER • 4-HOUR STOCK LOCK
          </span>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 sm:gap-3 group touch-manipulation min-h-[48px] py-1"
          >
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg bg-emerald-500 font-black text-black text-lg sm:text-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-transform shrink-0">
              SF
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-white">
                  SUPPLEMENT<span className="text-emerald-400">FACTORY</span>
                </span>
                <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-1 py-0.5 text-[8px] sm:text-[9px] font-bold tracking-wider text-emerald-400">
                  LK
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 hidden xs:block">
                Lab-Tested Performance Nutrition
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links (hidden on screens < lg) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs xl:text-sm font-bold uppercase tracking-wider text-zinc-400">
            <a href="#products" className="min-h-[48px] flex items-center hover:text-emerald-400 transition-colors">
              Catalog
            </a>
            <a href="#how-to-order" className="min-h-[48px] flex items-center hover:text-emerald-400 transition-colors gap-1.5">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              How to Order
            </a>
            <a href="#trainer-promo" className="min-h-[48px] flex items-center hover:text-emerald-400 transition-colors gap-1.5">
              <Tag className="h-4 w-4 text-emerald-400" />
              Trainer Discounts
            </a>
            <a href="#lab-purity" className="min-h-[48px] flex items-center hover:text-emerald-400 transition-colors gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Purity & Lab
            </a>
          </nav>

          {/* Action Controls & Mobile Toggles */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% Genuine Batches</span>
            </div>

            {/* Cart Trigger (Minimum 48px touch area) */}
            <button
              onClick={onOpenCart}
              aria-label={`Open Cart with ${cartCount} items`}
              className="relative flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 sm:px-4 min-h-[48px] font-black uppercase text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-95 cursor-pointer touch-manipulation"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-emerald-400">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger Toggle (Visible under lg) */}
            <button
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="lg:hidden flex items-center justify-center min-h-[48px] min-w-[48px] rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors touch-manipulation cursor-pointer active:scale-95"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-emerald-400" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Full-Screen Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden border-t border-zinc-800 bg-zinc-950/98 px-4 pt-3 pb-6 backdrop-blur-xl overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                {/* Store Links */}
                <a
                  href="#products"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between min-h-[48px] rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-200 bg-zinc-900/60 border border-zinc-800/80 active:bg-emerald-500/10 active:border-emerald-500/40 active:text-emerald-400 transition-colors touch-manipulation"
                >
                  <span className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Hardcore Catalog
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </a>

                <a
                  href="#how-to-order"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between min-h-[48px] rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-200 bg-zinc-900/60 border border-zinc-800/80 active:bg-emerald-500/10 active:border-emerald-500/40 active:text-emerald-400 transition-colors touch-manipulation"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-emerald-400" />
                    How to Order (4H Lock)
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </a>

                <a
                  href="#trainer-promo"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between min-h-[48px] rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-200 bg-zinc-900/60 border border-zinc-800/80 active:bg-emerald-500/10 active:border-emerald-500/40 active:text-emerald-400 transition-colors touch-manipulation"
                >
                  <span className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-emerald-400" />
                    Trainer Discounts (5% Off)
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </a>

                <a
                  href="#lab-purity"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between min-h-[48px] rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-200 bg-zinc-900/60 border border-zinc-800/80 active:bg-emerald-500/10 active:border-emerald-500/40 active:text-emerald-400 transition-colors touch-manipulation"
                >
                  <span className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    Purity & Temperature Storage
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </a>

                {/* Internal Portals Divider */}
                <div className="pt-2 border-t border-zinc-800/80 mt-1 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">
                    Portals & Management
                  </span>

                  <Link
                    href="/trainer"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between min-h-[48px] rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-300 bg-black/60 border border-zinc-800 active:bg-emerald-500/10 active:text-emerald-400 transition-colors touch-manipulation"
                  >
                    <span className="flex items-center gap-2.5">
                      <Dumbbell className="h-4 w-4 text-emerald-400" />
                      Trainer Affiliate Portal
                    </span>
                    <span className="text-[10px] text-zinc-500">Coach Login</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between min-h-[48px] rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-300 bg-black/60 border border-zinc-800 active:bg-orange-500/10 active:text-orange-400 transition-colors touch-manipulation"
                  >
                    <span className="flex items-center gap-2.5">
                      <Lock className="h-4 w-4 text-orange-400" />
                      Staff Command Center
                    </span>
                    <span className="text-[10px] text-zinc-500">Ops / Admin</span>
                  </Link>
                </div>

                {/* Mobile Cart Button inside menu */}
                <button
                  onClick={() => {
                    closeMobileMenu();
                    onOpenCart();
                  }}
                  className="mt-3 flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-emerald-500 active:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider shadow-lg touch-manipulation"
                >
                  <ShoppingBag className="h-4 w-4" />
                  View WhatsApp Cart ({cartCount} Items)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar (Screens < md) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/90 backdrop-blur-xl px-2 py-1 shadow-[0_-10px_25px_rgba(0,0,0,0.8)] pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
          {/* Tab 1: Catalog */}
          <a
            href="#products"
            className="flex flex-col items-center justify-center min-h-[48px] py-1 text-zinc-400 hover:text-emerald-400 active:text-emerald-400 touch-manipulation transition-colors"
          >
            <Zap className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Catalog</span>
          </a>

          {/* Tab 2: How to Order */}
          <a
            href="#how-to-order"
            className="flex flex-col items-center justify-center min-h-[48px] py-1 text-zinc-400 hover:text-emerald-400 active:text-emerald-400 touch-manipulation transition-colors"
          >
            <HelpCircle className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">4H Lock</span>
          </a>

          {/* Tab 3: Trainer Promo */}
          <a
            href="#trainer-promo"
            className="flex flex-col items-center justify-center min-h-[48px] py-1 text-zinc-400 hover:text-emerald-400 active:text-emerald-400 touch-manipulation transition-colors"
          >
            <Tag className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Discounts</span>
          </a>

          {/* Tab 4: Cart */}
          <button
            onClick={onOpenCart}
            aria-label={`Open Cart (${cartCount})`}
            className="relative flex flex-col items-center justify-center min-h-[48px] py-1 text-emerald-400 touch-manipulation active:scale-95 transition-transform"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-black">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-white mt-0.5">
              Cart
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
