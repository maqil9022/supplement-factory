"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { CheckoutDrawer } from "@/components/CheckoutDrawer";
import { CustomerHowToOrder } from "@/components/CustomerHowToOrder";
import { CustomerTrainerPromoBanner } from "@/components/CustomerTrainerPromoBanner";
import { MOCK_PRODUCTS } from "@/lib/supabase";
import { Product, CartItem } from "@/lib/types";
import {
  Zap,
  ShieldCheck,
  Truck,
  Flame,
  Clock,
  ArrowRight,
  Send,
  Dumbbell,
  Award,
  Sparkles,
  Lock,
} from "lucide-react";

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen to disable heavy parallax and prevent battery drain/lag
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Parallax scroll hooks (damped/disabled on mobile for 60fps scrolling)
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const desktopTubY = useTransform(scrollYProgress, [0, 0.25], [0, 120]);
  const desktopTubRotate = useTransform(scrollYProgress, [0, 0.25], [-2, 6]);
  const desktopBgMeshOpacity = useTransform(scrollYProgress, [0, 0.3], [0.8, 0.3]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => setCart([]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-white selection:bg-emerald-400 selection:text-black pb-20 md:pb-0"
    >
      {/* Dynamic Gritty Noise Background (static opacity on mobile) */}
      <motion.div
        style={{ opacity: isMobile ? 0.6 : desktopBgMeshOpacity }}
        className="fixed inset-0 pointer-events-none z-0 bg-carbon-pattern"
      />

      {/* Customer Header & Bottom Bar */}
      <Navbar cartCount={totalCartCount} onOpenCart={() => setIsDrawerOpen(true)} />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Explosive Off-Screen Tub Slide-In (Responsive 60fps) */}
      {/* ========================================================================= */}
      <section className="relative z-10 overflow-hidden pt-6 pb-14 sm:pt-16 sm:pb-28">
        {/* Glow Spheres */}
        <div className="absolute top-10 left-1/4 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px] sm:blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-[240px] w-[240px] sm:h-[350px] sm:w-[350px] rounded-full bg-emerald-500/10 blur-[90px] sm:blur-[130px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy: Aggressive Masculine Headers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-7 flex flex-col gap-4 sm:gap-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-400 self-start">
                <Flame className="h-3.5 w-3.5 fill-emerald-400 shrink-0" />
                <span className="truncate">SRI LANKA&apos;S #1 LAB-TESTED PERFORMANCE NUTRITION</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.05] sm:leading-[0.95] text-white break-words">
                UNCOMPROMISING <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300">
                  ANABOLIC POWER.
                </span>
                <br />
                ZERO BULLSH*T.
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-xl font-medium leading-relaxed">
                Precision-engineered isolates, high-stim pre-workouts, and Creapure® creatine. Formulated for Sri Lankan tropical climate humidity with 100% verifiable batch certificates.
              </p>

              {/* Unique Customer Value Props (Mobile Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md pt-1">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400">
                    <Clock className="h-4 w-4 shrink-0" />
                    4-Hour Stock Lock
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-normal">
                    Your tubs are reserved automatically while you complete bank transfer.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400">
                    <Send className="h-4 w-4 shrink-0" />
                    WhatsApp Bank Slip
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-normal">
                    Direct transfer (BOC, ComBank, Sampath). No credit card surcharges.
                  </p>
                </div>
              </div>

              {/* Responsive CTAs (Full width on mobile, minimum 48px tap height) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a
                  href="#products"
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 min-h-[48px] py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer touch-manipulation"
                >
                  Explore Hardcore Catalog
                  <ArrowRight className="h-4 w-4" />
                </a>

                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-6 min-h-[48px] py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-all cursor-pointer touch-manipulation active:scale-95"
                >
                  Quick WhatsApp Checkout ({totalCartCount})
                </button>
              </div>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-3 border-t border-zinc-900 text-xs text-zinc-400">
                <div>
                  <div className="text-lg sm:text-xl font-black text-white">48 Hours</div>
                  <span className="text-[11px] sm:text-xs">Islandwide Dispatch</span>
                </div>
                <div className="border-l border-zinc-850 pl-3 sm:pl-6">
                  <div className="text-lg sm:text-xl font-black text-emerald-400">100% Pure</div>
                  <span className="text-[11px] sm:text-xs">Lab Tested Batches</span>
                </div>
                <div className="border-l border-zinc-850 pl-3 sm:pl-6">
                  <div className="text-lg sm:text-xl font-black text-white">5% OFF</div>
                  <span className="text-[11px] sm:text-xs">Trainer Promo Code</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual: Tub Hero Stage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              style={isMobile ? undefined : { y: desktopTubY, rotate: desktopTubRotate }}
              className="lg:col-span-5 relative flex items-center justify-center mt-2 lg:mt-0"
            >
              {/* Radial Energy Ring */}
              <div className="absolute h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96 rounded-full border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none" />

              <div className="relative h-64 w-64 sm:h-80 sm:w-80 md:h-[420px] md:w-[420px] drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)]">
                <Image
                  src="https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1000&q=85"
                  alt="Apex Hydrolyzed Whey Isolate Supplement Tub"
                  fill
                  priority
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 380px, 450px"
                  className="object-contain filter contrast-125"
                />
              </div>

              {/* Floating Pill: Live Hub Stock */}
              <div className="absolute -bottom-2 sm:bottom-4 left-2 sm:left-0 rounded-xl border border-emerald-500/40 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-md max-w-[260px] sm:max-w-none">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] sm:text-xs font-black uppercase text-emerald-400">
                    Central Colombo Warehouse
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-300 font-bold mt-0.5">
                  21 Tubs In Stock For Instant Dispatch
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. VALUE BANNER: Trust & Sri Lankan Banking Partners */}
      {/* ========================================================================= */}
      <section className="border-y border-zinc-800 bg-zinc-950 py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="flex flex-col items-center p-2">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 mb-1" />
              <span className="text-xs font-black uppercase text-white">24-48h Islandwide</span>
              <span className="text-[10px] sm:text-[11px] text-zinc-400">Colombo, Kandy, Galle</span>
            </div>
            <div className="flex flex-col items-center p-2">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 mb-1" />
              <span className="text-xs font-black uppercase text-white">Direct Importer</span>
              <span className="text-[10px] sm:text-[11px] text-zinc-400">Batch COA & QR Verified</span>
            </div>
            <div className="flex flex-col items-center p-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 mb-1" />
              <span className="text-xs font-black uppercase text-white">4-Hour Stock Hold</span>
              <span className="text-[10px] sm:text-[11px] text-zinc-400">Zero inventory sniping</span>
            </div>
            <div className="flex flex-col items-center p-2">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 mb-1" />
              <span className="text-xs font-black uppercase text-white">BOC • ComBank • Sampath</span>
              <span className="text-[10px] sm:text-[11px] text-zinc-400">Instant WhatsApp approval</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PRODUCT CATALOG: Responsive 1-col mobile, 2-col tablet, 4-col desktop */}
      {/* ========================================================================= */}
      <section id="products" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-400 mb-1.5">
                <Zap className="h-3.5 w-3.5" />
                Lab-Tested Active Lineup
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
                Engineered For <span className="text-emerald-400">Anabolic Dominance</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-xl">
                Every batch is temperature-controlled in Colombo. Tap any product to lock inventory for 4 hours while you transfer via WhatsApp.
              </p>
            </div>

            <span className="text-[11px] sm:text-xs font-mono text-zinc-500 self-start sm:self-auto">
              [ REAL-TIME ATP INVENTORY ENABLED ]
            </span>
          </div>

          {/* Product Cards Grid: Mobile-First Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {MOCK_PRODUCTS.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CUSTOMER HOW TO ORDER (Zero Friction WhatsApp Bank Transfer) */}
      {/* ========================================================================= */}
      <CustomerHowToOrder />

      {/* ========================================================================= */}
      {/* 5. CUSTOMER TRAINER DISCOUNT BANNER */}
      {/* ========================================================================= */}
      <CustomerTrainerPromoBanner />

      {/* ========================================================================= */}
      {/* 6. LAB PURITY & TEMPERATURE STORAGE GUARANTEE */}
      {/* ========================================================================= */}
      <section id="lab-purity" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-zinc-800 bg-black/60 p-6 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left">
              <div>
                <Sparkles className="h-7 w-7 text-emerald-400 mb-2.5 mx-auto md:mx-0" />
                <h4 className="text-base sm:text-lg font-black uppercase text-white mb-1">
                  100% Lab Tested Purity
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Heavy metal tested, micro-filtered protein isolates with zero amino spiking. Third-party verified COA on every batch.
                </p>
              </div>

              <div>
                <ShieldCheck className="h-7 w-7 text-emerald-400 mb-2.5 mx-auto md:mx-0" />
                <h4 className="text-base sm:text-lg font-black uppercase text-white mb-1">
                  Tropical Humidity Sealed
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Pre-workouts and creatines are stored in 24/7 air-conditioned humidity-controlled hubs to prevent clumping.
                </p>
              </div>

              <div>
                <Truck className="h-7 w-7 text-emerald-400 mb-2.5 mx-auto md:mx-0" />
                <h4 className="text-base sm:text-lg font-black uppercase text-white mb-1">
                  Express Islandwide Courier
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Same-day handover to Koombiyo and Pronto courier networks. Real-time SMS tracking updates on all parcels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FRICTIONLESS CHECKOUT DRAWER */}
      {/* ========================================================================= */}
      <CheckoutDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* ========================================================================= */}
      {/* 8. FOOTER WITH DISCREET PORTAL LINKS */}
      {/* ========================================================================= */}
      <footer className="border-t border-zinc-900 bg-black py-10 px-4 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <span className="font-black text-white text-sm">
              SUPPLEMENT<span className="text-emerald-400">FACTORY</span> LK
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-zinc-400">Sri Lanka&apos;s Premium Heavyweight Performance Nutrition</span>
          </div>

          {/* Discreet Internal Access Links for Staff & Coaches */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Link
              href="/trainer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 min-h-[44px] py-2 px-1 touch-manipulation"
            >
              <Dumbbell className="h-4 w-4" />
              Trainer Portal
            </Link>
            <span className="text-zinc-700">•</span>
            <Link
              href="/admin"
              className="hover:text-orange-400 transition-colors flex items-center gap-1.5 min-h-[44px] py-2 px-1 touch-manipulation"
            >
              <Lock className="h-4 w-4" />
              Staff Command Center
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl mt-6 pt-6 border-t border-zinc-900 text-center text-zinc-600 text-[11px]">
          © {new Date().getFullYear()} Supplement Factory Sri Lanka. All Rights Reserved. Bank Transfers: Commercial Bank, BOC, Sampath Bank.
        </div>
      </footer>
    </div>
  );
}
