"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  Dumbbell,
  ReceiptText,
  FileSpreadsheet,
  Download,
  Filter,
  Package,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { Product, Affiliate, AffiliatePayout, InventoryBatch } from "@/lib/types";
import { formatLKR } from "@/lib/utils";

// Minimal Order type matching AdminDashboard
export interface ReportOrder {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  status: "AWAITING_SLIP" | "CONFIRMED" | "SHIPPED";
  created_at: string;
  applied_promo_code?: string;
  affiliate_commission_amount?: number;
}

interface AdminReportsManagerProps {
  orders: ReportOrder[];
  products: Product[];
  trainers: Affiliate[];
  payouts: AffiliatePayout[];
  batches: InventoryBatch[];
}

type TimeRange = "today" | "yesterday" | "7days" | "30days" | "all";

export function AdminReportsManager({
  orders,
  products,
  trainers,
  payouts,
  batches,
}: AdminReportsManagerProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [activeReportTab, setActiveReportTab] = useState<
    "overview" | "daily" | "products" | "batches" | "trainers"
  >("overview");

  // Determine cutoff timestamps based on timeRange
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7Days = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const startOf30Days = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderTime = new Date(order.created_at).getTime();
      if (timeRange === "today") return orderTime >= startOfToday;
      if (timeRange === "yesterday")
        return orderTime >= startOfYesterday && orderTime < startOfToday;
      if (timeRange === "7days") return orderTime >= startOf7Days;
      if (timeRange === "30days") return orderTime >= startOf30Days;
      return true;
    });
  }, [orders, timeRange, startOfToday, startOfYesterday, startOf7Days, startOf30Days]);

  // Filter batches by time range
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const batchTime = new Date(batch.created_at).getTime();
      if (timeRange === "today") return batchTime >= startOfToday;
      if (timeRange === "yesterday")
        return batchTime >= startOfYesterday && batchTime < startOfToday;
      if (timeRange === "7days") return batchTime >= startOf7Days;
      if (timeRange === "30days") return batchTime >= startOf30Days;
      return true;
    });
  }, [batches, timeRange, startOfToday, startOfYesterday, startOf7Days, startOf30Days]);

  // Verified & Shipped revenue calculations (case-insensitive for database compatibility)
  const isOrderVerified = (status: string) => {
    const s = (status || "").toUpperCase();
    return s === "CONFIRMED" || s === "SHIPPED";
  };

  const isOrderPending = (status: string) => {
    const s = (status || "").toUpperCase();
    return s === "AWAITING_SLIP" || s === "AWAITING_PAYMENT";
  };

  const verifiedOrders = useMemo(
    () => filteredOrders.filter((o) => isOrderVerified(o.status)),
    [filteredOrders]
  );
  const pendingOrders = useMemo(
    () => filteredOrders.filter((o) => isOrderPending(o.status)),
    [filteredOrders]
  );

  // Financial calculations
  // Weighted / Average COGS ratio estimation based on product catalog
  const catalogAvgCostRatio = useMemo(() => {
    const totalCatalogPrice = products.reduce((acc, p) => acc + p.price, 0);
    const totalCatalogCost = products.reduce((acc, p) => acc + (p.cost_price || 0), 0);
    return totalCatalogPrice > 0 ? totalCatalogCost / totalCatalogPrice : 0.62;
  }, [products]);

  const grossRevenue = useMemo(
    () => verifiedOrders.reduce((sum, o) => sum + o.total_amount, 0),
    [verifiedOrders]
  );

  const pendingRevenue = useMemo(
    () => pendingOrders.reduce((sum, o) => sum + o.total_amount, 0),
    [pendingOrders]
  );

  // Cost of Goods Sold (estimated at weighted average cost ratio of catalog)
  const estimatedCOGS = useMemo(
    () => Math.round(grossRevenue * catalogAvgCostRatio),
    [grossRevenue, catalogAvgCostRatio]
  );

  const grossProfit = grossRevenue - estimatedCOGS;
  const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

  // Affiliate commissions paid/payable on verified orders
  const affiliateExpense = useMemo(
    () => verifiedOrders.reduce((sum, o) => sum + (o.affiliate_commission_amount || 0), 0),
    [verifiedOrders]
  );

  // Net Profit
  const netProfit = grossProfit - affiliateExpense;
  const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Inventory Asset Valuation (Global across entire warehouse)
  const inventoryStats = useMemo(() => {
    const totalPhysicalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const totalReservedUnits = products.reduce((sum, p) => sum + p.reserved_stock, 0);
    const totalAvailableATP = totalPhysicalUnits - totalReservedUnits;
    const totalCostValue = products.reduce(
      (sum, p) => sum + p.stock * (p.cost_price || 0),
      0
    );
    const totalRetailValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
    const unrealizedGrossProfit = totalRetailValue - totalCostValue;
    const unrealizedMargin =
      totalRetailValue > 0 ? (unrealizedGrossProfit / totalRetailValue) * 100 : 0;

    return {
      totalPhysicalUnits,
      totalReservedUnits,
      totalAvailableATP,
      totalCostValue,
      totalRetailValue,
      unrealizedGrossProfit,
      unrealizedMargin,
    };
  }, [products]);

  // Restock batch investments
  const totalRestockInvestment = useMemo(
    () => filteredBatches.reduce((sum, b) => sum + b.total_cost, 0),
    [filteredBatches]
  );
  const totalRestockUnits = useMemo(
    () => filteredBatches.reduce((sum, b) => sum + b.quantity_added, 0),
    [filteredBatches]
  );

  // Daily Breakdown Aggregation
  const dailyBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        ordersCount: number;
        verifiedCount: number;
        revenue: number;
        cogs: number;
        commissions: number;
        netProfit: number;
      }
    >();

    orders.forEach((order) => {
      const dateKey = order.created_at.slice(0, 10);
      const isVerified = isOrderVerified(order.status);
      const existing = map.get(dateKey) || {
        date: dateKey,
        ordersCount: 0,
        verifiedCount: 0,
        revenue: 0,
        cogs: 0,
        commissions: 0,
        netProfit: 0,
      };

      existing.ordersCount += 1;
      if (isVerified) {
        existing.verifiedCount += 1;
        existing.revenue += order.total_amount;
        const estCost = Math.round(order.total_amount * catalogAvgCostRatio);
        const comm = order.affiliate_commission_amount || 0;
        existing.cogs += estCost;
        existing.commissions += comm;
        existing.netProfit += order.total_amount - estCost - comm;
      }

      map.set(dateKey, existing);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [orders, catalogAvgCostRatio]);

  // Product Margin Matrix
  const productMargins = useMemo(() => {
    return products.map((prod) => {
      const unitCost = prod.cost_price || 0;
      const unitPrice = prod.price;
      const unitProfit = unitPrice - unitCost;
      const marginPercent = unitPrice > 0 ? (unitProfit / unitPrice) * 100 : 0;
      const totalStockCost = prod.stock * unitCost;
      const totalStockRevenue = prod.stock * unitPrice;
      const potentialProfit = totalStockRevenue - totalStockCost;

      // Estimate units sold from orders
      const ordersWithItem = orders.filter(
        (o) => o.status === "CONFIRMED" || o.status === "SHIPPED"
      );
      // approximate sample unit volume
      const estimatedUnitsSold = Math.max(
        1,
        Math.floor((ordersWithItem.length * (prod.reserved_stock + 1)) / (products.length || 1))
      );
      const historicalRevenue = estimatedUnitsSold * unitPrice;
      const historicalProfit = estimatedUnitsSold * unitProfit;

      return {
        ...prod,
        unitCost,
        unitPrice,
        unitProfit,
        marginPercent,
        totalStockCost,
        totalStockRevenue,
        potentialProfit,
        estimatedUnitsSold,
        historicalRevenue,
        historicalProfit,
      };
    });
  }, [products, orders]);

  // Export Financial Summary to CSV/Text
  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Total Orders",
      "Verified Orders",
      "Gross Revenue (LKR)",
      "Estimated COGS (LKR)",
      "Affiliate Commissions (LKR)",
      "Net Profit (LKR)",
      "Net Margin %",
    ];

    const rows = dailyBreakdown.map((d) => [
      d.date,
      d.ordersCount,
      d.verifiedCount,
      d.revenue,
      d.cogs,
      d.commissions,
      d.netProfit,
      d.revenue > 0 ? ((d.netProfit / d.revenue) * 100).toFixed(1) + "%" : "0%",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SupplementFactory_Financial_Report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
            <Sparkles className="h-4 w-4" />
            Executive Financial & Profit Intelligence
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight">
            System Performance <span className="text-orange-500">& Profit Reports</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time Profit & Loss statement, batch cost fluctuation tracking, and inventory valuation.
          </p>
        </div>

        {/* Time Filter Buttons & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs">
            {(
              [
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "7days", label: "7 Days" },
                { id: "30days", label: "30 Days" },
                { id: "all", label: "All Time" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  timeRange === t.id
                    ? "bg-orange-500 text-black shadow-md font-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700 transition-colors cursor-pointer"
            title="Download CSV Financial Statement"
          >
            <Download size={14} className="text-orange-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveReportTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
            activeReportTab === "overview"
              ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <TrendingUp size={14} />
          P&L Overview
        </button>

        <button
          onClick={() => setActiveReportTab("daily")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
            activeReportTab === "daily"
              ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Calendar size={14} />
          Daily Progress ({dailyBreakdown.length} Days)
        </button>

        <button
          onClick={() => setActiveReportTab("products")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
            activeReportTab === "products"
              ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Layers size={14} />
          Product Profit Margins ({products.length})
        </button>

        <button
          onClick={() => setActiveReportTab("batches")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
            activeReportTab === "batches"
              ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Boxes size={14} />
          Restock Batches Log ({batches.length})
        </button>

        <button
          onClick={() => setActiveReportTab("trainers")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
            activeReportTab === "trainers"
              ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Dumbbell size={14} />
          Trainer Commission Impact ({trainers.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: EXECUTIVE FINANCIAL OVERVIEW */}
      {/* ========================================================================= */}
      {activeReportTab === "overview" && (
        <div className="space-y-6">
          {/* Top Scorecard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Gross Revenue */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Gross Realized Sales</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {formatLKR(grossRevenue)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                <span>Verified Orders:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {verifiedOrders.length} orders
                </span>
              </div>
              {pendingRevenue > 0 && (
                <div className="text-[10px] text-amber-400 mt-1">
                  + {formatLKR(pendingRevenue)} pending bank slips
                </div>
              )}
            </div>

            {/* Card 2: Cost of Goods Sold (COGS) */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Est. Cost of Goods (COGS)</span>
                <Boxes className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-200 font-mono">
                {formatLKR(estimatedCOGS)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                <span>Cost Ratio:</span>
                <span className="font-mono font-bold text-neutral-300">
                  {(catalogAvgCostRatio * 100).toFixed(1)}% of Revenue
                </span>
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Based on landed restock unit batch costs
              </div>
            </div>

            {/* Card 3: Trainer Affiliate Commissions */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Affiliate Commission Cut</span>
                <Dumbbell className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
                {formatLKR(affiliateExpense)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                <span>Commission Load:</span>
                <span className="font-mono font-bold text-orange-300">
                  {grossRevenue > 0
                    ? ((affiliateExpense / grossRevenue) * 100).toFixed(1)
                    : 0}
                  % of Revenue
                </span>
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Credited to verified gym coaches
              </div>
            </div>

            {/* Card 4: Net System Profit */}
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 relative overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Net System Profit</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {formatLKR(netProfit)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-emerald-500/20 pt-2">
                <span>Net Margin %:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {netMarginPercent.toFixed(1)}%
                </span>
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-1 font-semibold">
                Clean profit after COGS & Coach Cuts
              </div>
            </div>
          </div>

          {/* Profit & Loss Flow Waterfall Card */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-orange-500" />
              Profit & Loss Waterfall Breakdown ({timeRange.toUpperCase()})
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {/* Row 1: Gross Revenue */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-neutral-800">
                <div className="flex items-center gap-2 text-white font-sans font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  (+) Realized Gross Revenue (Confirmed + Shipped)
                </div>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatLKR(grossRevenue)}
                </span>
              </div>

              {/* Row 2: COGS */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-300 font-sans font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  (-) Cost of Goods Sold (Unit Acquisition & Batch Freight)
                </div>
                <span className="font-bold text-amber-400 text-sm">
                  - {formatLKR(estimatedCOGS)}
                </span>
              </div>

              {/* Subtotal: Gross Profit */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-700/80">
                <div className="font-sans font-black uppercase text-neutral-200">
                  (=) Gross Brand Profit
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 font-sans">
                    {grossMarginPercent.toFixed(1)}% Gross Margin
                  </span>
                  <span className="font-bold text-white text-base">
                    {formatLKR(grossProfit)}
                  </span>
                </div>
              </div>

              {/* Row 3: Affiliate Commissions */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-300 font-sans font-medium">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  (-) Trainer Affiliate Commission Give-Outs
                </div>
                <span className="font-bold text-orange-400 text-sm">
                  - {formatLKR(affiliateExpense)}
                </span>
              </div>

              {/* Final Net Profit */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/50 shadow-lg">
                <div>
                  <div className="font-sans font-black uppercase text-emerald-300 text-sm">
                    (=) Net Operating Profit
                  </div>
                  <div className="text-[11px] font-sans text-emerald-400/80">
                    Net cash available for company reinvestment & dividends
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400">
                    {formatLKR(netProfit)}
                  </div>
                  <div className="text-xs font-bold text-emerald-300 font-sans">
                    {netMarginPercent.toFixed(1)}% Net Margin
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Working Capital & Warehouse Asset Valuation Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Inventory Capital Health */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-orange-400" />
                  <h3 className="font-black text-sm uppercase text-white">
                    Warehouse Inventory Asset Valuation
                  </h3>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {inventoryStats.totalPhysicalUnits} Total Tubs
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">Capital Invested at Cost:</span>
                  <span className="text-lg font-black text-white font-mono">
                    {formatLKR(inventoryStats.totalCostValue)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Working capital tied up in stock
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">Potential Retail Value:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {formatLKR(inventoryStats.totalRetailValue)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Total expected cash-in
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-neutral-300 block">
                    Unrealized Inventory Profit Potential:
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Gross profit when remaining stock is cleared
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-emerald-400 text-base">
                    +{formatLKR(inventoryStats.unrealizedGrossProfit)}
                  </span>
                  <span className="block text-[11px] text-neutral-400 font-mono">
                    {inventoryStats.unrealizedMargin.toFixed(1)}% Project Margin
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
                <span>Stock Readiness:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {inventoryStats.totalAvailableATP} Units Available ATP (Unreserved)
                </span>
              </div>
            </div>

            {/* Right: Restock Batches Capital Outlay */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-orange-400" />
                  <h3 className="font-black text-sm uppercase text-white">
                    Batch Restocking Capital Flow
                  </h3>
                </div>
                <span className="text-xs font-mono text-orange-400">
                  {batches.length} Batches Recorded
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">Batch Units Inflow:</span>
                  <span className="text-lg font-black text-white font-mono">
                    +{totalRestockUnits} Units
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Across {filteredBatches.length} shipments ({timeRange})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">Total Batch Outlay:</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {formatLKR(totalRestockInvestment)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Paid to ingredient suppliers
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  Latest Batch Restock Outlays:
                </span>
                {batches.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-black/40 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white line-clamp-1">{b.product_name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {b.batch_number || "BATCH"} • +{b.quantity_added} units @ LKR{" "}
                        {b.unit_cost_price.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-neutral-200">
                      {formatLKR(b.total_cost)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: DAILY PROGRESS & PROFIT TABLE */}
      {/* ========================================================================= */}
      {activeReportTab === "daily" && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-black text-base uppercase text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                Day-by-Day Revenue & Profit Trajectory
              </h3>
              <p className="text-xs text-neutral-400">
                Tracking daily dispatch volumes, slip confirmations, and net profit margins.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {dailyBreakdown.length} Active Sales Days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-black uppercase text-neutral-400">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Orders</th>
                  <th className="py-3 px-3">Verified</th>
                  <th className="py-3 px-3 text-right">Gross Revenue</th>
                  <th className="py-3 px-3 text-right">Est. COGS</th>
                  <th className="py-3 px-3 text-right">Trainer Cut</th>
                  <th className="py-3 px-3 text-right">Net Profit</th>
                  <th className="py-3 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {dailyBreakdown.map((day) => {
                  const dayMargin =
                    day.revenue > 0 ? (day.netProfit / day.revenue) * 100 : 0;
                  return (
                    <tr key={day.date} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-white font-sans">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-3 text-neutral-300 font-sans">
                        {day.ordersCount}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                          {day.verifiedCount} Paid
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatLKR(day.revenue)}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400/90">
                        {day.cogs > 0 ? formatLKR(day.cogs) : "-"}
                      </td>
                      <td className="py-3 px-3 text-right text-orange-400">
                        {day.commissions > 0 ? formatLKR(day.commissions) : "-"}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400">
                        {day.netProfit > 0 ? formatLKR(day.netProfit) : "-"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            dayMargin >= 30
                              ? "bg-emerald-500/20 text-emerald-400"
                              : dayMargin > 0
                              ? "bg-amber-500/20 text-amber-400"
                              : "text-neutral-500"
                          }`}
                        >
                          {dayMargin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PRODUCT PROFIT MARGINS */}
      {/* ========================================================================= */}
      {activeReportTab === "products" && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-black text-base uppercase text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-orange-500" />
                Product Profitability & Unit Spread Matrix
              </h3>
              <p className="text-xs text-neutral-400">
                Detailed margin spread between batch cost prices and live retail storefront prices.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {products.length} Formulations Cataloged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-black uppercase text-neutral-400">
                  <th className="py-3 px-3">Product / SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Unit Cost</th>
                  <th className="py-3 px-3 text-right">Retail Price</th>
                  <th className="py-3 px-3 text-right">Profit / Tub</th>
                  <th className="py-3 px-3 text-right">Gross Margin %</th>
                  <th className="py-3 px-3 text-right">Warehouse Units</th>
                  <th className="py-3 px-3 text-right">Stock Profit Potential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {productMargins.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white line-clamp-1">{item.name}</div>
                      <div className="text-[10px] text-orange-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="py-3 px-3 font-sans text-neutral-400">{item.category}</td>
                    <td className="py-3 px-3 text-right text-neutral-300">
                      LKR {item.unitCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      LKR {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400">
                      +LKR {item.unitProfit.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-black ${
                          item.marginPercent >= 35
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {item.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-300">
                      {item.stock} tubs
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {formatLKR(item.potentialProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: RESTOCK BATCHES LOG */}
      {/* ========================================================================= */}
      {activeReportTab === "batches" && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-black text-base uppercase text-white flex items-center gap-2">
                <Boxes className="h-4 w-4 text-orange-500" />
                Inventory Restock Batches Audit Log
              </h3>
              <p className="text-xs text-neutral-400">
                Batch-specific landed unit cost tracking. If cost changes by batch, historical records are preserved.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {batches.length} Consignments Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-black uppercase text-neutral-400">
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Batch Number</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3 text-right">Units Added</th>
                  <th className="py-3 px-3 text-right">Unit Cost (Batch)</th>
                  <th className="py-3 px-3 text-right">Batch Total Cost</th>
                  <th className="py-3 px-3 text-right">Batch Retail Price</th>
                  <th className="py-3 px-3">Supplier & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3 font-sans text-neutral-400 text-[11px]">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold text-[11px]">
                        {b.batch_number || "BATCH-UNASSIGNED"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-bold text-white">
                      {b.product_name}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      +{b.quantity_added}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-200">
                      LKR {b.unit_cost_price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-400">
                      {formatLKR(b.total_cost)}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-300">
                      LKR {b.selling_price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-sans text-neutral-400 text-[11px]">
                      <div className="text-white font-medium">{b.supplier_name || "-"}</div>
                      {b.notes && <div className="text-[10px] text-neutral-500">{b.notes}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: TRAINER COMMISSION IMPACT */}
      {/* ========================================================================= */}
      {activeReportTab === "trainers" && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-black text-base uppercase text-white flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-orange-500" />
                Trainer Affiliate ROI & Commission Burden
              </h3>
              <p className="text-xs text-neutral-400">
                Evaluation of trainer-driven referral orders, customer discounts granted, and net company profitability.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {trainers.length} Certified Gym Coaches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 text-xs">
              <span className="text-neutral-400 block mb-1">Total Lifetime Trainer Earnings:</span>
              <span className="text-xl font-black text-white font-mono">
                {formatLKR(trainers.reduce((s, t) => s + t.total_earnings, 0))}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 text-xs">
              <span className="text-neutral-400 block mb-1">Total Payouts Settled:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {formatLKR(payouts.reduce((s, p) => s + p.amount, 0))}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 text-xs">
              <span className="text-neutral-400 block mb-1">Current Unpaid Balances:</span>
              <span className="text-xl font-black text-orange-400 font-mono">
                {formatLKR(trainers.reduce((s, t) => s + t.unpaid_balance, 0))}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-black uppercase text-neutral-400">
                  <th className="py-3 px-3">Coach Name</th>
                  <th className="py-3 px-3">Gym Affiliation</th>
                  <th className="py-3 px-3">Promo Code</th>
                  <th className="py-3 px-3 text-right">Commission Rate</th>
                  <th className="py-3 px-3 text-right">Lifetime Earnings</th>
                  <th className="py-3 px-3 text-right">Unpaid Balance</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {trainers.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-white">
                      {t.trainer_name}
                    </td>
                    <td className="py-3 px-3 font-sans text-neutral-400">{t.gym_name || "-"}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold text-[11px]">
                        {t.promo_code}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-300">
                      {t.commission_rate}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatLKR(t.total_earnings)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-orange-400">
                      {formatLKR(t.unpaid_balance)}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {t.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
