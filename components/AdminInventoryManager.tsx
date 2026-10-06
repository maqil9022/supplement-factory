"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Product, CreateProductInput, RestockBatchInput, InventoryBatch } from "@/lib/types";
import { formatLKR } from "@/lib/utils";
import {
  Package,
  Plus,
  PlusCircle,
  Search,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  Flame,
  Tag,
  Eye,
  EyeOff,
  TrendingUp,
  Wallet,
  Boxes,
} from "lucide-react";

interface AdminInventoryManagerProps {
  products: Product[];
  batches?: InventoryBatch[];
  onAddProduct: (input: CreateProductInput) => void;
  onRestockProduct: (input: RestockBatchInput) => void;
  onToggleActive: (productId: string, isActive: boolean) => void;
  onNavigateToReports?: () => void;
}

const CATEGORIES = ["All", "Protein", "Pre-Workout", "Strength", "Mass Gainer"];

const IMAGE_PRESETS = [
  {
    name: "Whey Isolate Tub (Dark)",
    url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Pre-Workout Tub (Neon)",
    url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Creatine Tub (White)",
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mass Gainer Tub (Large)",
    url: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80",
  },
];

export function AdminInventoryManager({
  products,
  batches = [],
  onAddProduct,
  onRestockProduct,
  onToggleActive,
  onNavigateToReports,
}: AdminInventoryManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(10);
  const [restockUnitCost, setRestockUnitCost] = useState<number>(0);
  const [restockSellingPrice, setRestockSellingPrice] = useState<number>(0);
  const [restockBatchNumber, setRestockBatchNumber] = useState<string>("");
  const [restockSupplier, setRestockSupplier] = useState<string>("");
  const [restockNotes, setRestockNotes] = useState<string>("");

  const handleOpenRestock = (product: Product) => {
    setRestockProduct(product);
    setRestockQuantity(10);
    setRestockUnitCost(product.cost_price || 0);
    setRestockSellingPrice(product.price);
    const catCode = product.sku.split("-")[1] || "STK";
    const dateCode = new Date().toISOString().slice(0, 7).replace("-", "");
    setRestockBatchNumber(`BATCH-${dateCode}-${catCode}-${Math.floor(100 + Math.random() * 900)}`);
    setRestockSupplier("");
    setRestockNotes("");
  };

  // New Product Form State
  const [formData, setFormData] = useState<CreateProductInput>({
    sku: "",
    name: "",
    category: "Protein",
    flavor: "",
    size_weight: "",
    price: 25000,
    cost_price: 16000,
    stock: 20,
    description: "",
    image_url: IMAGE_PRESETS[0].url,
    badge: "NEW ARRIVAL",
    nutrition_facts: {
      "Protein per Scoop": "25g",
      "BCAAs": "5.5g",
      "Servings": "60 Servings",
    },
  });

  const handleGenerateSKU = () => {
    if (!formData.name) return;
    const catCode = formData.category.slice(0, 3).toUpperCase();
    const nameCode = formData.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w.slice(0, 3))
      .join("-")
      .toUpperCase();
    setFormData((prev) => ({
      ...prev,
      sku: `SF-${catCode}-${nameCode}-${Math.floor(100 + Math.random() * 900)}`,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || formData.price <= 0 || formData.cost_price < 0) {
      alert("Please provide product name, SKU, valid selling price, and cost price.");
      return;
    }
    onAddProduct(formData);
    setIsAddModalOpen(false);
    // Reset
    setFormData({
      sku: "",
      name: "",
      category: "Protein",
      flavor: "",
      size_weight: "",
      price: 25000,
      cost_price: 16000,
      stock: 20,
      description: "",
      image_url: IMAGE_PRESETS[0].url,
      badge: "NEW ARRIVAL",
      nutrition_facts: {
        "Protein per Scoop": "25g",
        "BCAAs": "5.5g",
        "Servings": "60 Servings",
      },
    });
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || restockQuantity <= 0) return;
    if (restockUnitCost < 0) {
      alert("Batch unit cost price cannot be negative.");
      return;
    }
    onRestockProduct({
      productId: restockProduct.id,
      quantityToAdd: restockQuantity,
      unitCostPrice: restockUnitCost,
      newSellingPrice: restockSellingPrice > 0 ? restockSellingPrice : undefined,
      batchNumber: restockBatchNumber || undefined,
      supplierName: restockSupplier || undefined,
      notes: restockNotes || undefined,
    });
    setRestockProduct(null);
    setRestockQuantity(10);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.flavor && p.flavor.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // KPI Calculations
  const totalPhysicalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalReservedUnits = products.reduce((sum, p) => sum + p.reserved_stock, 0);
  const totalAvailableUnits = totalPhysicalUnits - totalReservedUnits;
  const lowStockCount = products.filter(
    (p) => p.stock - p.reserved_stock > 0 && p.stock - p.reserved_stock <= 10
  ).length;
  const outOfStockCount = products.filter(
    (p) => p.stock - p.reserved_stock <= 0
  ).length;

  // Asset Valuation & Margin Metrics
  const totalAssetCostValue = products.reduce(
    (sum, p) => sum + p.stock * (p.cost_price || 0),
    0
  );
  const totalRetailValue = products.reduce(
    (sum, p) => sum + p.stock * p.price,
    0
  );
  const totalProjectedProfit = totalRetailValue - totalAssetCostValue;
  const averageMarginPercent =
    totalRetailValue > 0
      ? (totalProjectedProfit / totalRetailValue) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Controls & KPI Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-500" />
            Inventory & Stock Engine
          </h2>
          <p className="text-xs text-neutral-400">
            Available-To-Promise (ATP) tracking, unit cost valuations, and central warehouse restocking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="flex items-center gap-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-orange-400 border border-orange-500/30 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <TrendingUp size={15} />
              Reports & Profit
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-95"
          >
            <Plus size={16} />
            Add Item To Inventory
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Total Available (ATP)
          </span>
          <div className="text-2xl font-black text-emerald-400">{totalAvailableUnits} Tubs</div>
          <span className="text-[10px] text-neutral-500">Ready for instant sale</span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            4-Hour Reserved
          </span>
          <div className="text-2xl font-black text-amber-400">{totalReservedUnits} Tubs</div>
          <span className="text-[10px] text-neutral-500">Awaiting WhatsApp slip</span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block mb-1 flex items-center justify-between">
            <span>Asset Value (Cost)</span>
            <Wallet size={12} />
          </span>
          <div className="text-xl font-black text-white font-mono">
            LKR {totalAssetCostValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-500">Capital tied in warehouse</span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1 flex items-center justify-between">
            <span>Retail Valuation</span>
            <TrendingUp size={12} />
          </span>
          <div className="text-xl font-black text-white font-mono">
            LKR {totalRetailValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">
            Gross Margin: +{averageMarginPercent.toFixed(1)}%
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Physical Warehouse Total
          </span>
          <div className="text-2xl font-black text-white">{totalPhysicalUnits} Units</div>
          <span className="text-[10px] text-neutral-500">
            {lowStockCount} low • {outOfStockCount} out of stock
          </span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-neutral-800 pb-4">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-orange-500 text-black font-black"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, Name or Flavor..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/50">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-neutral-900 border-b border-neutral-800 text-[11px] font-black uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="p-4">Product & SKU</th>
              <th className="p-4">Category & Badge</th>
              <th className="p-4">Price & Cost (Unit)</th>
              <th className="p-4">Stock Breakdown</th>
              <th className="p-4">Asset Value (Cost)</th>
              <th className="p-4">ATP Status</th>
              <th className="p-4">Visibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80">
            {filteredProducts.map((product) => {
              const available = Math.max(0, product.stock - product.reserved_stock);
              const isLow = available > 0 && available <= 10;
              const isOut = available <= 0;
              const cost = product.cost_price || 0;
              const profitPerUnit = product.price - cost;
              const marginPercent = product.price > 0 ? (profitPerUnit / product.price) * 100 : 0;
              const lotCostValue = product.stock * cost;

              return (
                <tr key={product.id} className="hover:bg-neutral-900/80 transition-colors">
                  {/* Product Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 rounded-lg bg-black/60 p-1 border border-neutral-800">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-black text-white text-sm line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {product.flavor || "Formula"} • {product.size_weight}
                        </div>
                        <div className="font-mono text-[10px] text-orange-400 font-bold mt-0.5">
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Badge */}
                  <td className="p-4">
                    <span className="inline-block px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold text-[10px] uppercase mb-1">
                      {product.category}
                    </span>
                    {product.badge && (
                      <div className="text-[10px] font-bold text-orange-400">
                        ★ {product.badge}
                      </div>
                    )}
                  </td>

                  {/* Pricing & Unit Cost */}
                  <td className="p-4">
                    <div className="font-black text-white text-sm">
                      {formatLKR(product.price)}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                      <span className="text-neutral-500">Cost:</span>
                      <span className="font-mono text-neutral-300 font-bold">
                        LKR {cost.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <TrendingUp size={10} />
                      <span>+{marginPercent.toFixed(1)}% (+LKR {profitPerUnit.toLocaleString()})</span>
                    </div>
                  </td>

                  {/* Stock Breakdown */}
                  <td className="p-4 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{product.stock} Physical</span>
                      <span className="text-neutral-500">/</span>
                      <span className="text-amber-400 font-bold">{product.reserved_stock} Held</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      {product.reserved_stock > 0
                        ? `${product.reserved_stock} locked in 4h WhatsApp orders`
                        : "No active holds"}
                    </div>
                  </td>

                  {/* Total Lot Asset Value (At Cost) */}
                  <td className="p-4">
                    <div className="font-mono font-bold text-white text-xs">
                      LKR {lotCostValue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      Retail: LKR {(product.stock * product.price).toLocaleString()}
                    </div>
                  </td>

                  {/* ATP Status */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isOut
                            ? "bg-red-500"
                            : isLow
                            ? "bg-amber-400 animate-ping"
                            : "bg-emerald-400 animate-pulse"
                        }`}
                      />
                      <span
                        className={`font-black text-xs uppercase tracking-wide ${
                          isOut
                            ? "text-red-400"
                            : isLow
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {isOut ? "OUT OF STOCK" : `${available} AVAILABLE`}
                      </span>
                    </div>
                  </td>

                  {/* Visibility Toggle */}
                  <td className="p-4">
                    <button
                      onClick={() => onToggleActive(product.id, !product.is_active)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        product.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {product.is_active ? (
                        <>
                          <Eye size={12} /> Live
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} /> Hidden
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenRestock(product)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 hover:text-white px-3 py-1.5 text-xs font-bold text-neutral-300 transition-colors cursor-pointer border border-neutral-700 active:scale-95"
                    >
                      <PlusCircle size={14} className="text-orange-400" />
                      Restock Units
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW PRODUCT TO INVENTORY */}
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
              className="relative z-10 w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-black uppercase text-white">
                    Add New Supplement Formula
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {/* Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-400">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. APEX 100% HYDROLYZED WHEY"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="Protein">Protein (Isolate / Whey)</option>
                      <option value="Pre-Workout">Pre-Workout (High Stim / Pump)</option>
                      <option value="Strength">Strength (Creatine / Creapure)</option>
                      <option value="Mass Gainer">Mass Gainer (Clean Carb)</option>
                      <option value="Amino & Recovery">Amino & Recovery (BCAAs / EAAs)</option>
                    </select>
                  </div>
                </div>

                {/* SKU Auto-Generator */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-neutral-400">Stock Keeping Unit (SKU) *</label>
                    <button
                      type="button"
                      onClick={handleGenerateSKU}
                      className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      ⚡ Auto-Generate SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. SF-PRO-APEX-101"
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 font-mono uppercase text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Flavor & Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-400">Flavor Name</label>
                    <input
                      type="text"
                      value={formData.flavor}
                      onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                      placeholder="e.g. Dark Belgian Chocolate"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400">Size / Weight</label>
                    <input
                      type="text"
                      value={formData.size_weight}
                      onChange={(e) => setFormData({ ...formData, size_weight: e.target.value })}
                      placeholder="e.g. 5.0 lbs (2.27 kg)"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pricing, Cost & Stock Structure */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-orange-500" />
                      Cost, Pricing & Stock Economics (LKR)
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">Confidential Admin Ledger</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Unit Cost Price */}
                    <div>
                      <label className="font-bold text-neutral-400 flex items-center justify-between text-[11px]">
                        <span>Unit Cost Price (LKR) *</span>
                        <span className="text-[10px] text-orange-400 font-normal">Wholesale/Import</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                        placeholder="e.g. 16000"
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 font-mono text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    {/* Retail Selling Price */}
                    <div>
                      <label className="font-bold text-neutral-400 flex items-center justify-between text-[11px]">
                        <span>Selling Price (LKR) *</span>
                        <span className="text-[10px] text-emerald-400 font-normal">Customer Retail</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="e.g. 25000"
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 font-mono text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    {/* Initial Physical Stock */}
                    <div>
                      <label className="font-bold text-neutral-400 flex items-center justify-between text-[11px]">
                        <span>Initial Stock (Units) *</span>
                        <span className="text-[10px] text-neutral-400 font-normal">Physical</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 font-mono text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Live Profit Margin & Batch Economics Preview */}
                  {formData.price > 0 && (
                    <div
                      className={`p-3 rounded-lg border text-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5 transition-colors ${
                        formData.price >= formData.cost_price
                          ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                          : "bg-red-950/20 border-red-800/40 text-red-300"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Unit Profit</span>
                        <span className="font-mono font-bold text-sm text-white">
                          LKR {(formData.price - formData.cost_price).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Gross Margin</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            formData.price >= formData.cost_price ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {(((formData.price - formData.cost_price) / (formData.price || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Batch Investment</span>
                        <span className="font-mono font-bold text-sm text-amber-400">
                          LKR {(formData.stock * formData.cost_price).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Batch Gross Profit</span>
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          LKR {(formData.stock * (formData.price - formData.cost_price)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Display Badge Selector */}
                  <div>
                    <label className="font-bold text-neutral-400 text-[11px]">Marketing Display Badge</label>
                    <select
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="BESTSELLER">BESTSELLER</option>
                      <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                      <option value="HARDCORE STIM">HARDCORE STIM</option>
                      <option value="ESSENTIAL">ESSENTIAL</option>
                      <option value="HIGH CALORIE">HIGH CALORIE</option>
                    </select>
                  </div>
                </div>

                {/* Image Selection */}
                <div>
                  <label className="font-bold text-neutral-400 block mb-2">
                    Product Tub Image (Select Preset or Paste URL)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    {IMAGE_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setFormData({ ...formData, image_url: preset.url })}
                        className={`p-2 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          formData.image_url === preset.url
                            ? "border-orange-500 bg-orange-500/10 text-orange-400"
                            : "border-neutral-800 bg-black/40 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <div className="relative h-10 w-10">
                          <Image src={preset.url} alt={preset.name} fill className="object-contain" />
                        </div>
                        <span className="text-[9px] font-bold text-center line-clamp-1">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 text-[11px] text-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold text-neutral-400">Formula Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Clinical highlights, protein purity, digestive enzymes..."
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 rounded-xl bg-orange-500 hover:bg-orange-400 py-3 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer"
                >
                  Save & Add To Live Inventory
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: RESTOCK UNITS (BATCH-SPECIFIC COST & SELLING PRICE TRACKER) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {restockProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRestockProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-7 text-white shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="text-base font-black uppercase text-white">
                      Restock Inventory Batch
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Record batch unit cost & selling price. Handles cost fluctuations per shipment.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRestockProduct(null)}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Product Info Bar */}
              <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 rounded bg-black/60 p-1">
                  <Image
                    src={restockProduct.image_url}
                    alt={restockProduct.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-white line-clamp-1">
                    {restockProduct.name}
                  </h4>
                  <p className="font-mono text-xs text-orange-400">{restockProduct.sku}</p>
                  <div className="text-[11px] text-neutral-400 mt-1 flex gap-4">
                    <span>
                      Current Physical: <strong className="text-white">{restockProduct.stock}</strong>
                    </span>
                    <span>
                      Available ATP:{" "}
                      <strong className="text-emerald-400">
                        {Math.max(0, restockProduct.stock - restockProduct.reserved_stock)}
                      </strong>
                    </span>
                    <span>
                      Base Unit Cost:{" "}
                      <strong className="text-neutral-300">
                        LKR {(restockProduct.cost_price || 0).toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
                {/* Units Received */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-neutral-300">
                      Units Received To Add To Warehouse: *
                    </label>
                    <span className="text-[10px] text-orange-400 font-mono">
                      Physical stock will increase
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 font-mono text-base font-bold text-white focus:border-orange-500 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    {[5, 10, 25, 50, 100].map((qty) => (
                      <button
                        type="button"
                        key={qty}
                        onClick={() => setRestockQuantity(qty)}
                        className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono font-bold hover:border-orange-500 transition-colors cursor-pointer"
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Batch Cost Price & Selling Price Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-300 block mb-1">
                      Batch Unit Landed Cost (LKR): *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={restockUnitCost}
                      onChange={(e) => setRestockUnitCost(Number(e.target.value))}
                      placeholder="e.g. 22000"
                      className="w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 font-mono font-bold text-amber-400 focus:border-orange-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 block mt-1">
                      Unit cost for this specific shipment batch.
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-300 block mb-1">
                      Storefront Selling Price (LKR): *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={restockSellingPrice}
                      onChange={(e) => setRestockSellingPrice(Number(e.target.value))}
                      placeholder="e.g. 34500"
                      className="w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 font-mono font-bold text-emerald-400 focus:border-orange-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 block mt-1">
                      Active customer price (adjust if batch cost shifted).
                    </span>
                  </div>
                </div>

                {/* Batch Code & Supplier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-400 block mb-1">
                      Batch / Consignment Code:
                    </label>
                    <input
                      type="text"
                      value={restockBatchNumber}
                      onChange={(e) => setRestockBatchNumber(e.target.value)}
                      placeholder="e.g. BATCH-202610-ISO-89"
                      className="w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 font-mono text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400 block mb-1">
                      Supplier / Importer:
                    </label>
                    <input
                      type="text"
                      value={restockSupplier}
                      onChange={(e) => setRestockSupplier(e.target.value)}
                      placeholder="e.g. Optimum Labs USA / Port Cargo"
                      className="w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Consignment Notes */}
                <div>
                  <label className="font-bold text-neutral-400 block mb-1">
                    Batch Notes / Tariff Shifts:
                  </label>
                  <input
                    type="text"
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    placeholder="e.g. Air freight express consignment, FX +2% adjusted"
                    className="w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Real-time Outlay & Margin Calculation Card */}
                {(() => {
                  const totalOutlay = restockQuantity * restockUnitCost;
                  const totalExpectedSales = restockQuantity * restockSellingPrice;
                  const projectedBatchProfit = totalExpectedSales - totalOutlay;
                  const projectedMarginPercent =
                    totalExpectedSales > 0 ? (projectedBatchProfit / totalExpectedSales) * 100 : 0;
                  const isNegativeMargin = restockUnitCost >= restockSellingPrice;

                  return (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5 space-y-2 text-[11px]">
                      <div className="flex justify-between items-center text-neutral-400">
                        <span>Restock Capital Outlay (At Cost):</span>
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {formatLKR(totalOutlay)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-neutral-400">
                        <span>Expected Retail Value:</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {formatLKR(totalExpectedSales)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-neutral-400 border-t border-neutral-800 pt-1.5">
                        <span>Projected Batch Profit:</span>
                        <div className="text-right">
                          <span
                            className={`font-mono font-black text-xs ${
                              isNegativeMargin ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {formatLKR(projectedBatchProfit)}
                          </span>
                          <span className="ml-2 font-mono text-[10px] text-neutral-400">
                            ({projectedMarginPercent.toFixed(1)}% margin)
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-neutral-400 border-t border-neutral-800 pt-1.5">
                        <span>Updated Physical Stock:</span>
                        <strong className="text-white font-mono">
                          {restockProduct.stock + Number(restockQuantity)} tubs (+{restockQuantity} added)
                        </strong>
                      </div>

                      {isNegativeMargin && (
                        <div className="rounded-lg bg-rose-950/40 border border-rose-500/40 p-2 text-rose-300 text-[10px] flex items-center gap-1.5 mt-1 font-bold">
                          <AlertTriangle size={14} className="shrink-0 text-rose-400" />
                          Warning: Unit cost is higher than or equal to selling price! Margin is zero or negative.
                        </div>
                      )}
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 hover:bg-orange-400 py-3 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer"
                >
                  Confirm Batch Restock & Update Stock
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
