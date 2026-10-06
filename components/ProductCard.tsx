"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { formatLKR } from "@/lib/utils";
import { Zap, Flame, ShoppingCart, Info, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  index: number;
}

export function ProductCard({ product, onAddToCart, index }: ProductCardProps) {
  const [showSpecs, setShowSpecs] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const availableStock = Math.max(0, product.stock - product.reserved_stock);
  const isLowStock = availableStock > 0 && availableStock <= 10;
  const isOutOfStock = availableStock === 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.3) }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300"
    >
      {/* Top Meta & Badges */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded bg-zinc-800/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-300 border border-zinc-700/60">
          <Zap className="h-3 w-3 text-emerald-400" />
          {product.category}
        </span>

        {product.badge && (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/40">
            <Flame className="h-3 w-3 fill-emerald-400" />
            {product.badge}
          </span>
        )}
      </div>

      {/* Supplement Visual Stage */}
      <div className="relative my-3 sm:my-4 flex h-52 sm:h-64 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-zinc-800/30 to-black/60 p-3 sm:p-4">
        {/* Glow backdrop on hover */}
        <div className="absolute inset-0 bg-emerald-500/0 blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500 pointer-events-none" />

        <div className="relative h-44 w-44 sm:h-56 sm:w-56 transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Available To Promise Inventory Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between rounded-lg bg-zinc-950/95 border border-zinc-800 px-2.5 py-1.5 backdrop-blur-md">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400">Hub Stock:</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isOutOfStock
                  ? "bg-red-500"
                  : isLowStock
                  ? "bg-amber-400 animate-ping"
                  : "bg-emerald-400 animate-pulse"
              }`}
            />
            <span
              className={`text-[10px] sm:text-xs font-black tracking-tight ${
                isOutOfStock
                  ? "text-red-400"
                  : isLowStock
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {isOutOfStock ? "SOLD OUT" : `${availableStock} TUBS LEFT`}
            </span>
          </div>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-[11px] sm:text-xs font-bold text-zinc-400">
          <span className="truncate pr-2">{product.flavor || "Formula"}</span>
          <span className="shrink-0">{product.size_weight}</span>
        </div>

        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Nutrition Specs Expandable Preview */}
        {product.nutrition_facts && (
          <div className="mt-1">
            <button
              onClick={() => setShowSpecs(!showSpecs)}
              type="button"
              className="flex items-center gap-1.5 min-h-[44px] py-2 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer touch-manipulation"
            >
              <Info className="h-3.5 w-3.5" />
              {showSpecs ? "Hide Lab Specs" : "View Lab Specs"}
            </button>

            {showSpecs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 grid grid-cols-2 gap-1.5 rounded-lg border border-zinc-800 bg-black/60 p-2.5 text-[11px]"
              >
                {Object.entries(product.nutrition_facts).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-zinc-400 text-[10px] truncate">{key}</span>
                    <span className="font-bold text-emerald-300 truncate">{val}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Price & Action */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Specialist Price
            </span>
            <div className="text-xl font-black text-white tracking-tight">
              {formatLKR(product.price)}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 min-h-[48px] w-full sm:w-auto text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 touch-manipulation ${
              isOutOfStock
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : justAdded
                ? "bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" />
                <span>Locked!</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
