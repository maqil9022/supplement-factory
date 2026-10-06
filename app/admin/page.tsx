"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
  ArrowLeft,
  Columns3,
  List,
  Truck,
  Zap,
  Dumbbell,
  ReceiptText,
  Boxes,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AdminTrainerManager } from "@/components/AdminTrainerManager";
import { AdminInventoryManager } from "@/components/AdminInventoryManager";
import { AdminStaffManager } from "@/components/AdminStaffManager";
import { AdminReportsManager } from "@/components/AdminReportsManager";
import {
  MOCK_AFFILIATES,
  MOCK_PAYOUTS,
  MOCK_PRODUCTS,
  MOCK_STAFF_USERS,
  MOCK_TRAINER_REQUESTS,
  MOCK_INVENTORY_BATCHES,
} from "@/lib/supabase";
import {
  Affiliate,
  AffiliatePayout,
  Product,
  CreateTrainerInput,
  UpdateTrainerInput,
  ProcessPayoutInput,
  CreateProductInput,
  StaffUser,
  CreateStaffUserInput,
  TrainerBankChangeRequest,
  RestockBatchInput,
  InventoryBatch,
} from "@/lib/types";

// Supabase client instance (with safe fallback for local development)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key";
const isConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  total_amount: number;
  status: "AWAITING_SLIP" | "CONFIRMED" | "SHIPPED";
  created_at: string;
  applied_promo_code?: string;
  affiliate_commission_amount?: number;
};

interface DatabaseOrderRecord {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_details?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  total_amount: number | string;
  status: Order["status"];
  created_at: string;
  applied_promo_code?: string;
  affiliate_commission_amount?: number;
}

// Default seed orders so the dashboard is interactive immediately
const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-101",
    order_number: "SF-20261003-8192",
    customer_name: "Dinesh Weerasinghe",
    customer_phone: "+94 77 382 1092",
    customer_address: "14/2 Inner Flower Road, Colombo 07",
    total_amount: 32775,
    status: "AWAITING_SLIP",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    applied_promo_code: "TRAINER-AQIL10",
    affiliate_commission_amount: 3277,
  },
  {
    id: "ord-102",
    order_number: "SF-20261003-4512",
    customer_name: "Kasun Senanayake",
    customer_phone: "+94 71 982 7411",
    customer_address: "98 Peradeniya Road, Kandy",
    total_amount: 18075,
    status: "CONFIRMED",
    created_at: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    applied_promo_code: "COACH-SHEHAN",
    affiliate_commission_amount: 1757,
  },
  {
    id: "ord-103",
    order_number: "SF-20261002-9901",
    customer_name: "Roshan Mendis",
    customer_phone: "+94 76 234 1982",
    customer_address: "55 Matara Road, Galle",
    total_amount: 49000,
    status: "SHIPPED",
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [trainers, setTrainers] = useState<Affiliate[]>(MOCK_AFFILIATES);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>(MOCK_PAYOUTS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(MOCK_STAFF_USERS);
  const [currentStaffUser, setCurrentStaffUser] = useState<StaffUser>(MOCK_STAFF_USERS[0]);
  const [bankRequests, setBankRequests] = useState<TrainerBankChangeRequest[]>(MOCK_TRAINER_REQUESTS);
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>(MOCK_INVENTORY_BATCHES);

  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(!isConfigured);
  const [adminTab, setAdminTab] = useState<"orders" | "inventory" | "trainers" | "staff" | "reports">("orders");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    // 1. Fetch initial orders from Supabase if configured or read local cache
    const fetchData = async () => {
      // Load local stored staff and requests if any
      try {
        const storedStaff = localStorage.getItem("sf_staff_users");
        if (storedStaff) {
          const parsed = JSON.parse(storedStaff) as StaffUser[];
          if (parsed.length > 0) {
            setStaffUsers(parsed);
            setCurrentStaffUser(parsed[0]);
          }
        }
        const storedRequests = localStorage.getItem("sf_bank_requests");
        if (storedRequests) {
          const parsedReq = JSON.parse(storedRequests) as TrainerBankChangeRequest[];
          if (parsedReq.length > 0) {
            setBankRequests(parsedReq);
          }
        }
        const storedTrainers = localStorage.getItem("sf_custom_trainers");
        if (storedTrainers) {
          const parsedT = JSON.parse(storedTrainers) as Affiliate[];
          if (parsedT.length > 0) {
            setTrainers(parsedT);
          }
        }
        const storedBatches = localStorage.getItem("sf_inventory_batches");
        if (storedBatches) {
          const parsedB = JSON.parse(storedBatches) as InventoryBatch[];
          if (parsedB.length > 0) {
            setInventoryBatches(parsedB);
          }
        }
        const storedProds = localStorage.getItem("sf_custom_products");
        if (storedProds) {
          const parsedP = JSON.parse(storedProds) as Product[];
          if (parsedP.length > 0) {
            setProducts(parsedP);
          }
        }
      } catch (e) {
        console.warn("Local storage parse note:", e);
      }

      if (isConfigured) {
        try {
          const { data: ordData } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

          if (ordData && ordData.length > 0) {
            const mappedOrders: Order[] = (ordData as unknown as DatabaseOrderRecord[]).map((d) => ({
              id: d.id,
              order_number: d.order_number,
              customer_name: d.customer_name || d.customer_details?.name || "Customer",
              customer_phone: d.customer_phone || d.customer_details?.phone || "-",
              customer_address: d.customer_address || d.customer_details?.address || "",
              total_amount: Number(d.total_amount),
              status: d.status,
              created_at: d.created_at,
              applied_promo_code: d.applied_promo_code,
              affiliate_commission_amount: d.affiliate_commission_amount,
            }));
            setOrders(mappedOrders);
          }

          // Fetch products
          const { data: prodData } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

          if (prodData && prodData.length > 0) {
            setProducts(prodData as Product[]);
          }

          // Fetch affiliates
          const { data: affData } = await supabase
            .from("affiliates")
            .select("*")
            .order("trainer_name", { ascending: true });

          if (affData && affData.length > 0) {
            setTrainers(affData as Affiliate[]);
          }

          // Fetch payouts
          const { data: payData } = await supabase
            .from("affiliate_payouts")
            .select("*")
            .order("created_at", { ascending: false });

          if (payData && payData.length > 0) {
            setPayouts(payData as AffiliatePayout[]);
          }

          // Fetch staff users
          const { data: staffData } = await supabase
            .from("staff_users")
            .select("*")
            .order("created_at", { ascending: false });

          if (staffData && staffData.length > 0) {
            setStaffUsers(staffData as StaffUser[]);
          }

          // Fetch trainer bank requests
          const { data: reqData } = await supabase
            .from("trainer_bank_change_requests")
            .select("*")
            .order("created_at", { ascending: false });

          if (reqData && reqData.length > 0) {
            setBankRequests(reqData as TrainerBankChangeRequest[]);
          }
        } catch (err) {
          console.warn("Using local fallback data:", err);
        }
      }
      setLoading(false);
    };

    fetchData();

    // 2. Subscribe to real-time inserts and updates on orders
    if (isConfigured) {
      const channel = supabase
        .channel("realtime-orders")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newOrd = payload.new as unknown as DatabaseOrderRecord;
              const formatted: Order = {
                id: newOrd.id,
                order_number: newOrd.order_number,
                customer_name: newOrd.customer_name || newOrd.customer_details?.name || "Customer",
                customer_phone: newOrd.customer_phone || newOrd.customer_details?.phone || "-",
                customer_address: newOrd.customer_address || newOrd.customer_details?.address || "",
                total_amount: Number(newOrd.total_amount),
                status: newOrd.status,
                created_at: newOrd.created_at,
                applied_promo_code: newOrd.applied_promo_code,
                affiliate_commission_amount: newOrd.affiliate_commission_amount,
              };
              setOrders((prev) => [formatted, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              const upd = payload.new as unknown as DatabaseOrderRecord;
              setOrders((prev) =>
                prev.map((order) =>
                  order.id === upd.id
                    ? {
                        ...order,
                        status: upd.status,
                        total_amount: Number(upd.total_amount),
                      }
                    : order
                )
              );
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setRealtimeConnected(true);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Order Approvals
  const approvePayment = async (orderId: string) => {
    if (!currentStaffUser.privileges.can_verify_orders) {
      showToast(`Access Denied: ${currentStaffUser.name} (${currentStaffUser.role}) does not have order verification privileges.`);
      return;
    }

    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "CONFIRMED" } : order
      )
    );

    // If order had an affiliate, optimistically credit their unpaid balance
    if (targetOrder?.applied_promo_code && targetOrder.affiliate_commission_amount) {
      setTrainers((prev) =>
        prev.map((t) =>
          t.promo_code.toUpperCase() === targetOrder.applied_promo_code?.toUpperCase()
            ? {
                ...t,
                total_earnings: t.total_earnings + targetOrder.affiliate_commission_amount!,
                unpaid_balance: t.unpaid_balance + targetOrder.affiliate_commission_amount!,
              }
            : t
        )
      );
    }

    showToast("Slip Verified! Inventory permanently deducted and Trainer credited.");

    if (isConfigured) {
      const { error } = await supabase
        .from("orders")
        .update({ status: "CONFIRMED" })
        .eq("id", orderId);

      if (error) {
        console.error("Error approving payment:", error);
      }
    }
  };

  const markShipped = async (orderId: string) => {
    if (!currentStaffUser.privileges.can_verify_orders) {
      showToast(`Access Denied: ${currentStaffUser.name} (${currentStaffUser.role}) does not have shipping authorization privileges.`);
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "SHIPPED" } : order
      )
    );
    showToast("Order dispatched via Koombiyo / Pronto logistics!");

    if (isConfigured) {
      await supabase
        .from("orders")
        .update({ status: "SHIPPED" })
        .eq("id", orderId);
    }
  };

  // Add Trainer Action
  const handleAddTrainer = async (input: CreateTrainerInput) => {
    const newAffiliate: Affiliate = {
      id: `aff-${Date.now()}`,
      trainer_name: input.trainer_name,
      email: input.email || `${input.trainer_name.toLowerCase().replace(/[^a-z0-9]/g, "")}@supplementfactory.lk`,
      password: input.password || "coach123",
      gym_name: input.gym_name,
      promo_code: input.promo_code.toUpperCase(),
      discount_percent: input.discount_percent,
      commission_rate: input.commission_rate,
      total_earnings: 0,
      unpaid_balance: 0,
      phone: input.phone,
      bank_name: input.bank_name,
      bank_branch: input.bank_branch,
      bank_account_no: input.bank_account_no,
      bank_account_name: input.bank_account_name,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setTrainers((prev) => [newAffiliate, ...prev]);
    showToast(`Coach ${input.trainer_name} activated with code ${input.promo_code}!`);

    if (isConfigured) {
      try {
        await supabase.from("affiliates").insert({
          trainer_name: input.trainer_name,
          email: newAffiliate.email,
          password_hash: newAffiliate.password,
          gym_name: input.gym_name,
          promo_code: input.promo_code.toUpperCase(),
          discount_percent: input.discount_percent,
          commission_rate: input.commission_rate,
          phone: input.phone,
          bank_name: input.bank_name,
          bank_branch: input.bank_branch,
          bank_account_no: input.bank_account_no,
          bank_account_name: input.bank_account_name,
        });
      } catch (err) {
        console.error("Error creating affiliate in Supabase:", err);
      }
    }
  };

  // Edit Current Trainer Action
  const handleEditTrainer = async (input: UpdateTrainerInput) => {
    if (!currentStaffUser.privileges.can_approve_bank_changes && !currentStaffUser.privileges.can_manage_staff) {
      showToast(`Access Denied: ${currentStaffUser.name} (${currentStaffUser.role}) cannot modify trainer profiles.`);
      return;
    }

    const updatedTrainers = trainers.map((t) =>
      t.id === input.id
        ? {
            ...t,
            trainer_name: input.trainer_name,
            email: input.email || t.email,
            password: input.password || t.password,
            gym_name: input.gym_name,
            promo_code: input.promo_code.toUpperCase(),
            discount_percent: input.discount_percent,
            commission_rate: input.commission_rate,
            phone: input.phone,
            bank_name: input.bank_name,
            bank_branch: input.bank_branch,
            bank_account_no: input.bank_account_no,
            bank_account_name: input.bank_account_name,
            is_active: input.is_active,
          }
        : t
    );

    setTrainers(updatedTrainers);

    // Save to local storage for persistence across tabs
    try {
      localStorage.setItem("sf_custom_trainers", JSON.stringify(updatedTrainers));
      // Sync active session if the trainer is currently logged in on this browser
      const sessionRaw = localStorage.getItem("sf_trainer_session");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session.id === input.id) {
          const updatedSession = { ...session, ...input, promo_code: input.promo_code.toUpperCase() };
          localStorage.setItem("sf_trainer_session", JSON.stringify(updatedSession));
        }
      }
    } catch (e) {
      console.warn("Storage sync error:", e);
    }

    showToast(`Coach ${input.trainer_name} updated successfully!`);

    if (isConfigured) {
      try {
        await supabase
          .from("affiliates")
          .update({
            trainer_name: input.trainer_name,
            email: input.email,
            password_hash: input.password,
            gym_name: input.gym_name,
            promo_code: input.promo_code.toUpperCase(),
            discount_percent: input.discount_percent,
            commission_rate: input.commission_rate,
            phone: input.phone,
            bank_name: input.bank_name,
            bank_branch: input.bank_branch,
            bank_account_no: input.bank_account_no,
            bank_account_name: input.bank_account_name,
            is_active: input.is_active,
          })
          .eq("id", input.id);
      } catch (err) {
        console.error("Error updating affiliate in Supabase:", err);
      }
    }
  };

  // Process / Settle Payout Action
  const handleProcessPayout = async (input: ProcessPayoutInput) => {
    if (!currentStaffUser.privileges.can_process_payouts) {
      showToast(`Access Denied: ${currentStaffUser.name} (${currentStaffUser.role}) cannot settle financial payouts.`);
      return;
    }

    const trainer = trainers.find((t) => t.id === input.affiliate_id);

    // 1. Deduct unpaid balance on trainer
    setTrainers((prev) =>
      prev.map((t) =>
        t.id === input.affiliate_id
          ? { ...t, unpaid_balance: Math.max(0, t.unpaid_balance - input.amount) }
          : t
      )
    );

    // 2. Add to payouts list
    const newPayout: AffiliatePayout = {
      id: `pay-${Date.now()}`,
      affiliate_id: input.affiliate_id,
      trainer_name: trainer?.trainer_name || "Trainer",
      amount: input.amount,
      bank_reference: input.bank_reference,
      bank_name: trainer?.bank_name,
      bank_account_no: trainer?.bank_account_no,
      notes: input.notes,
      status: "completed",
      created_at: new Date().toISOString(),
    };

    setPayouts((prev) => [newPayout, ...prev]);
    showToast(`Payout of LKR ${input.amount.toLocaleString()} recorded for ${trainer?.trainer_name}!`);

    if (isConfigured) {
      try {
        await supabase.rpc("process_affiliate_payout", {
          p_affiliate_id: input.affiliate_id,
          p_amount: input.amount,
          p_bank_reference: input.bank_reference,
          p_notes: input.notes,
        });
      } catch (err) {
        console.error("Error executing payout RPC:", err);
      }
    }
  };

  // Add Product To Inventory Action
  const handleAddProduct = async (input: CreateProductInput) => {
    if (!currentStaffUser.privileges.can_manage_inventory) {
      showToast(`Access Denied: ${currentStaffUser.name} (${currentStaffUser.role}) cannot add new inventory formulas.`);
      return;
    }

    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: input.sku.toUpperCase(),
      name: input.name,
      slug,
      category: input.category,
      flavor: input.flavor,
      size_weight: input.size_weight,
      price: input.price,
      cost_price: input.cost_price ?? 0,
      stock: input.stock,
      reserved_stock: 0,
      description: input.description,
      image_url: input.image_url,
      badge: input.badge,
      nutrition_facts: input.nutrition_facts,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setProducts((prev) => [newProd, ...prev]);
    showToast(`New formula ${input.name} added to live inventory with ${input.stock} units!`);

    if (isConfigured) {
      try {
        await supabase.from("products").insert({
          sku: newProd.sku,
          name: newProd.name,
          slug: newProd.slug,
          category: newProd.category,
          flavor: newProd.flavor,
          size_weight: newProd.size_weight,
          price: newProd.price,
          cost_price: newProd.cost_price,
          stock: newProd.stock,
          reserved_stock: 0,
          description: newProd.description,
          image_url: newProd.image_url,
          badge: newProd.badge,
          nutrition_facts: newProd.nutrition_facts,
        });
      } catch (err) {
        console.error("Error inserting product into Supabase:", err);
      }
    }
  };

  // Restock Units Action (with Batch Cost & Selling Price Tracking)
  const handleRestockProduct = async (input: RestockBatchInput) => {
    if (!currentStaffUser.privileges.can_manage_inventory) {
      showToast(`Access Denied: ${currentStaffUser.name} (${currentStaffUser.role}) cannot restock inventory units.`);
      return;
    }

    const targetProduct = products.find((p) => p.id === input.productId);
    if (!targetProduct) return;

    // 1. Update product stock, cost_price (latest batch cost), and price (if newSellingPrice provided)
    const updatedProducts = products.map((p) => {
      if (p.id === input.productId) {
        return {
          ...p,
          stock: p.stock + input.quantityToAdd,
          cost_price: input.unitCostPrice,
          price: input.newSellingPrice && input.newSellingPrice > 0 ? input.newSellingPrice : p.price,
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    // 2. Create and record new InventoryBatch
    const newBatch: InventoryBatch = {
      id: `batch-${Date.now()}`,
      product_id: input.productId,
      product_name: targetProduct.name,
      product_sku: targetProduct.sku,
      quantity_added: input.quantityToAdd,
      unit_cost_price: input.unitCostPrice,
      total_cost: input.quantityToAdd * input.unitCostPrice,
      selling_price: input.newSellingPrice && input.newSellingPrice > 0 ? input.newSellingPrice : targetProduct.price,
      batch_number: input.batchNumber || `BATCH-${new Date().toISOString().slice(0, 7).replace("-", "")}-${targetProduct.sku.slice(0, 6)}`,
      supplier_name: input.supplierName || "Standard Consignment",
      notes: input.notes || "Landed restock consignment",
      created_at: new Date().toISOString(),
    };

    const updatedBatches = [newBatch, ...inventoryBatches];
    setInventoryBatches(updatedBatches);

    try {
      localStorage.setItem("sf_inventory_batches", JSON.stringify(updatedBatches));
      localStorage.setItem("sf_custom_products", JSON.stringify(updatedProducts));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }

    showToast(
      `Restocked +${input.quantityToAdd} units of ${targetProduct.name} (Batch: ${newBatch.batch_number}) at LKR ${input.unitCostPrice.toLocaleString()} cost!`
    );

    if (isConfigured) {
      try {
        await supabase.from("inventory_batches").insert({
          product_id: input.productId,
          quantity_added: input.quantityToAdd,
          unit_cost_price: input.unitCostPrice,
          selling_price: newBatch.selling_price,
          batch_number: newBatch.batch_number,
          supplier_name: newBatch.supplier_name,
          notes: newBatch.notes,
        });

        await supabase.rpc("restock_product", {
          p_product_id: input.productId,
          p_quantity_to_add: input.quantityToAdd,
        });
      } catch (err) {
        console.error("Error restocking product:", err);
      }
    }
  };

  // Toggle Product Visibility
  const handleToggleActive = async (productId: string, isActive: boolean) => {
    if (!currentStaffUser.privileges.can_manage_inventory) {
      showToast(`Access Denied: ${currentStaffUser.role} cannot toggle product visibility.`);
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_active: isActive } : p))
    );
    showToast(isActive ? "Product published to store." : "Product hidden from store.");

    if (isConfigured) {
      await supabase
        .from("products")
        .update({ is_active: isActive })
        .eq("id", productId);
    }
  };

  // Staff & Privileges: 1. Approve Trainer Bank Change Request
  const handleApproveBankChange = async (requestId: string) => {
    if (!currentStaffUser.privileges.can_approve_bank_changes) {
      showToast(`Access Denied: Role ${currentStaffUser.role} is not authorized to approve bank updates.`);
      return;
    }

    const req = bankRequests.find((r) => r.id === requestId);
    if (!req) return;

    // Update request status
    const updatedRequests = bankRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "APPROVED" as const,
            reviewed_by: currentStaffUser.name,
            reviewed_by_role: currentStaffUser.role,
            reviewed_at: new Date().toISOString(),
          }
        : r
    );
    setBankRequests(updatedRequests);
    try {
      localStorage.setItem("sf_bank_requests", JSON.stringify(updatedRequests));
    } catch (e) {
      console.warn("Error storing requests:", e);
    }

    // Atomically write new bank account details into trainers
    const updatedTrainers = trainers.map((t) =>
      t.id === req.affiliate_id
        ? {
            ...t,
            bank_name: req.requested_bank_name,
            bank_branch: req.requested_bank_branch,
            bank_account_no: req.requested_bank_account_no,
            bank_account_name: req.requested_bank_account_name,
            phone: req.requested_phone || t.phone,
          }
        : t
    );
    setTrainers(updatedTrainers);
    try {
      localStorage.setItem("sf_custom_trainers", JSON.stringify(updatedTrainers));
      // If the coach is currently logged into trainer portal on same browser, sync their session
      const sessionRaw = localStorage.getItem("sf_trainer_session");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session.id === req.affiliate_id) {
          session.bank_name = req.requested_bank_name;
          session.bank_branch = req.requested_bank_branch;
          session.bank_account_no = req.requested_bank_account_no;
          session.bank_account_name = req.requested_bank_account_name;
          localStorage.setItem("sf_trainer_session", JSON.stringify(session));
        }
      }
    } catch (e) {
      console.warn("Error syncing session:", e);
    }

    showToast(`Bank change approved for Coach ${req.trainer_name}! Payouts will route to ${req.requested_bank_name}.`);

    if (isConfigured) {
      try {
        await supabase.rpc("approve_trainer_bank_change", {
          p_request_id: requestId,
          p_staff_name: currentStaffUser.name,
        });
      } catch (err) {
        console.error("Error executing approve_trainer_bank_change RPC:", err);
      }
    }
  };

  // Staff & Privileges: 2. Reject Trainer Bank Change Request
  const handleRejectBankChange = async (requestId: string, reason: string) => {
    if (!currentStaffUser.privileges.can_approve_bank_changes) {
      showToast(`Access Denied: Role ${currentStaffUser.role} cannot review bank updates.`);
      return;
    }

    const req = bankRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedRequests = bankRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "REJECTED" as const,
            rejection_reason: reason,
            reviewed_by: currentStaffUser.name,
            reviewed_by_role: currentStaffUser.role,
            reviewed_at: new Date().toISOString(),
          }
        : r
    );
    setBankRequests(updatedRequests);
    try {
      localStorage.setItem("sf_bank_requests", JSON.stringify(updatedRequests));
    } catch (e) {
      console.warn("Error storing requests:", e);
    }

    showToast(`Bank change request rejected for Coach ${req.trainer_name}. Reason recorded.`);

    if (isConfigured) {
      try {
        await supabase
          .from("trainer_bank_change_requests")
          .update({
            status: "REJECTED",
            rejection_reason: reason,
            reviewed_by: currentStaffUser.name,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", requestId);
      } catch (err) {
        console.error("Error updating rejection in Supabase:", err);
      }
    }
  };

  // Staff & Privileges: 3. Add New Staff User
  const handleAddStaffUser = async (input: CreateStaffUserInput) => {
    if (!currentStaffUser.privileges.can_manage_staff) {
      showToast("Access Denied: Only Super Admin can provision staff accounts.");
      return;
    }

    const newStaff: StaffUser = {
      id: `staff-${Date.now()}`,
      name: input.name,
      email: input.email,
      role: input.role,
      phone: input.phone,
      is_active: true,
      privileges: input.privileges,
      created_at: new Date().toISOString(),
    };

    const updated = [newStaff, ...staffUsers];
    setStaffUsers(updated);
    try {
      localStorage.setItem("sf_staff_users", JSON.stringify(updated));
    } catch (e) {
      console.warn("Error storing staff:", e);
    }

    showToast(`Staff member ${input.name} (${input.role}) created successfully.`);

    if (isConfigured) {
      try {
        await supabase.from("staff_users").insert({
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role,
          phone: newStaff.phone,
          is_active: true,
          privileges: newStaff.privileges,
        });
      } catch (err) {
        console.error("Error inserting staff user into Supabase:", err);
      }
    }
  };

  // Staff & Privileges: 4. Toggle Staff User Active Status
  const handleToggleStaffStatus = async (userId: string, isActive: boolean) => {
    if (!currentStaffUser.privileges.can_manage_staff) {
      showToast("Access Denied: Only Super Admin can modify staff status.");
      return;
    }

    const updated = staffUsers.map((u) =>
      u.id === userId ? { ...u, is_active: isActive } : u
    );
    setStaffUsers(updated);
    try {
      localStorage.setItem("sf_staff_users", JSON.stringify(updated));
    } catch (e) {
      console.warn("Error storing staff:", e);
    }

    showToast(isActive ? "Staff account unlocked." : "Staff account suspended.");

    if (isConfigured) {
      try {
        await supabase.from("staff_users").update({ is_active: isActive }).eq("id", userId);
      } catch (err) {
        console.error("Error updating staff status in Supabase:", err);
      }
    }
  };

  // Staff & Privileges: 5. Switch Active Operator Context
  const handleSwitchStaffUser = (user: StaffUser) => {
    setCurrentStaffUser(user);
    showToast(`Active operator context switched to: ${user.name} [${user.role}]`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-orange-500">
        <AlertCircle className="animate-pulse" size={48} />
      </div>
    );
  }

  const awaitingOrders = orders.filter((o) => o.status === "AWAITING_SLIP");
  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED");
  const shippedOrders = orders.filter((o) => o.status === "SHIPPED");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-3.5 sm:p-6 md:p-8 font-sans selection:bg-orange-500 selection:text-black pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Back Navigation */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-orange-400 transition-colors min-h-[48px] py-2 touch-manipulation"
          >
            <ArrowLeft size={16} /> Back to Customer Storefront
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs text-neutral-500 font-mono">
              [ SECURED WAREHOUSE & AFFILIATE PORTAL ]
            </span>
            <div className="text-[10px] sm:text-xs text-neutral-500 font-mono">
              {isConfigured ? "Connected to Supabase" : "Offline Simulation Mode"}
            </div>
          </div>
        </div>

        {/* Command Center Header */}
        <header className="mb-6 sm:mb-8 border-b border-neutral-800 pb-5 sm:pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Central Warehouse Operations & Logistics
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Command <span className="text-orange-500">Center</span>
            </h1>
            <p className="text-neutral-400 mt-1 text-xs sm:text-sm md:text-base">
              WhatsApp bank slip verification, real-time inventory ATP monitoring & trainer commission give-outs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs sm:text-sm font-bold bg-neutral-900 px-3.5 py-2 rounded-lg border border-neutral-800 flex items-center gap-2 min-h-[40px]">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] sm:text-xs tracking-wider">
                {realtimeConnected ? "SYSTEM LIVE" : "CONNECTING..."}
              </span>
            </div>
          </div>
        </header>

        {/* Primary Operational Tabs (Horizontal Scrollable on Mobile) */}
        <div className="flex overflow-x-auto flex-nowrap scrollbar-none border-b border-neutral-800 mb-6 sm:mb-8 gap-1 sm:gap-0 pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          <button
            onClick={() => setAdminTab("orders")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[48px] touch-manipulation ${
              adminTab === "orders"
                ? "border-orange-500 text-orange-400 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <ReceiptText size={16} />
            Orders & Verification ({orders.length})
          </button>

          <button
            onClick={() => setAdminTab("inventory")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[48px] touch-manipulation ${
              adminTab === "inventory"
                ? "border-orange-500 text-orange-400 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Boxes size={16} />
            Inventory & Stock ({products.length})
          </button>

          <button
            onClick={() => setAdminTab("trainers")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[48px] touch-manipulation ${
              adminTab === "trainers"
                ? "border-orange-500 text-orange-400 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Dumbbell size={16} />
            Trainers & Give-Outs ({trainers.length})
          </button>

          <button
            onClick={() => setAdminTab("staff")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[48px] touch-manipulation ${
              adminTab === "staff"
                ? "border-orange-500 text-orange-400 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Shield size={16} />
            Staff & Privileges ({staffUsers.length})
            {bankRequests.filter((r) => r.status === "PENDING").length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black animate-pulse">
                {bankRequests.filter((r) => r.status === "PENDING").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab("reports")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[48px] touch-manipulation ${
              adminTab === "reports"
                ? "border-orange-500 text-orange-400 bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <TrendingUp size={16} />
            Reports & Profit Intelligence
          </button>
        </div>

        {/* Live Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/60 bg-emerald-950/80 p-4 text-xs font-bold text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            >
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* TAB 1: ORDERS & SLIP VERIFICATION */}
        {/* ========================================================================= */}
        {adminTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Live Inventory Slip Verifier
              </span>
              {/* View Switcher: Kanban vs List */}
              <div className="flex rounded-lg border border-neutral-800 bg-neutral-900 p-1 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase rounded-md transition-colors min-h-[40px] touch-manipulation ${
                    viewMode === "kanban"
                      ? "bg-orange-500 text-black font-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Columns3 size={14} /> Kanban
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase rounded-md transition-colors min-h-[40px] touch-manipulation ${
                    viewMode === "list"
                      ? "bg-orange-500 text-black font-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <List size={14} /> List
                </button>
              </div>
            </div>

            {/* KPI Counter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex sm:flex-col justify-between items-center sm:items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Awaiting Slips
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-orange-400">{awaitingOrders.length}</div>
                </div>
                <span className="text-[11px] text-neutral-500 sm:mt-1">4-Hour Temporary Hold</span>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex sm:flex-col justify-between items-center sm:items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Ready to Dispatch
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">{confirmedOrders.length}</div>
                </div>
                <span className="text-[11px] text-neutral-500 sm:mt-1">Stock Deducted</span>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex sm:flex-col justify-between items-center sm:items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    In Transit
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-sky-400">{shippedOrders.length}</div>
                </div>
                <span className="text-[11px] text-neutral-500 sm:mt-1">Islandwide Couriers</span>
              </div>
            </div>

            {/* Kanban View */}
            {viewMode === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Column 1: Awaiting Slip */}
                <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/40 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      <h3 className="font-black text-sm uppercase text-white tracking-wide">
                        Awaiting Bank Slip
                      </h3>
                    </div>
                    <span className="rounded-full bg-orange-500/20 border border-orange-500/40 px-2.5 py-0.5 text-xs font-black text-orange-400">
                      {awaitingOrders.length}
                    </span>
                  </div>

                  <div className="space-y-3.5 sm:space-y-4 flex-1">
                    {awaitingOrders.length === 0 ? (
                      <div className="text-center py-10 text-xs text-neutral-500">
                        No orders awaiting slip verification.
                      </div>
                    ) : (
                      awaitingOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-xl border border-orange-500/30 bg-black/80 p-4 transition-all hover:border-orange-500/60"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-orange-400">
                              {order.order_number}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-950/40 px-2 py-0.5 rounded">
                              <Clock className="h-3 w-3" /> 4h Hold
                            </span>
                          </div>

                          <div className="text-xs space-y-1.5 text-neutral-300">
                            <p className="font-black text-white text-sm">{order.customer_name}</p>
                            <p className="text-neutral-400 font-mono">
                              <a
                                href={`tel:${order.customer_phone}`}
                                className="hover:text-orange-400 underline decoration-dotted transition-colors"
                              >
                                {order.customer_phone}
                              </a>
                            </p>
                            {order.customer_address && (
                              <p className="text-neutral-500 text-[11px] line-clamp-1">{order.customer_address}</p>
                            )}
                            <p className="font-bold text-white text-base pt-1">
                              LKR {order.total_amount.toLocaleString()}
                            </p>
                            {order.applied_promo_code && (
                              <p className="text-[11px] text-neutral-400">
                                Trainer: <span className="text-orange-400 font-bold font-mono">{order.applied_promo_code}</span> (+LKR {order.affiliate_commission_amount?.toLocaleString()})
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => approvePayment(order.id)}
                            className="mt-4 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 py-3 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] cursor-pointer touch-manipulation"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve Slip & Deduct Stock
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2: Confirmed / Ready to Ship */}
                <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/40 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <h3 className="font-black text-sm uppercase text-white tracking-wide">
                        Confirmed / Packed
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-black text-emerald-400">
                      {confirmedOrders.length}
                    </span>
                  </div>

                  <div className="space-y-3.5 sm:space-y-4 flex-1">
                    {confirmedOrders.length === 0 ? (
                      <div className="text-center py-10 text-xs text-neutral-500">
                        No orders waiting for courier pickup.
                      </div>
                    ) : (
                      confirmedOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-xl border border-emerald-500/30 bg-black/80 p-4 transition-all hover:border-emerald-500/60"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              {order.order_number}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">
                              Paid & Secured
                            </span>
                          </div>

                          <div className="text-xs space-y-1.5 text-neutral-300">
                            <p className="font-black text-white text-sm">{order.customer_name}</p>
                            <p className="text-neutral-400 font-mono">
                              <a
                                href={`tel:${order.customer_phone}`}
                                className="hover:text-emerald-400 underline decoration-dotted transition-colors"
                              >
                                {order.customer_phone}
                              </a>
                            </p>
                            {order.customer_address && (
                              <p className="text-neutral-400 text-[11px]">{order.customer_address}</p>
                            )}
                            <p className="font-bold text-emerald-400 text-base pt-1">
                              Paid: LKR {order.total_amount.toLocaleString()}
                            </p>
                          </div>

                          <button
                            onClick={() => markShipped(order.id)}
                            className="mt-4 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors cursor-pointer border border-neutral-700 touch-manipulation"
                          >
                            <Package className="h-4 w-4 text-orange-400" />
                            Handover To Courier
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 3: Shipped / In Transit */}
                <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/40 p-3.5 sm:p-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-sky-400" />
                      <h3 className="font-black text-sm uppercase text-white tracking-wide">
                        In Transit (Islandwide)
                      </h3>
                    </div>
                    <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2.5 py-0.5 text-xs font-black text-sky-400">
                      {shippedOrders.length}
                    </span>
                  </div>

                  <div className="space-y-3.5 sm:space-y-4 flex-1">
                    {shippedOrders.length === 0 ? (
                      <div className="text-center py-10 text-xs text-neutral-500">
                        No orders currently in transit.
                      </div>
                    ) : (
                      shippedOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-xl border border-neutral-800 bg-black/60 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-neutral-400">
                              {order.order_number}
                            </span>
                            <span className="text-[10px] font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded">
                              Dispatched
                            </span>
                          </div>

                          <div className="text-xs space-y-1.5 text-neutral-300">
                            <p className="font-black text-white">{order.customer_name}</p>
                            <p className="text-neutral-400">{order.customer_address}</p>
                            <p className="text-neutral-400 pt-1 font-mono text-[11px]">
                              Tracking: LK-EXPRESS-{order.order_number.slice(-4)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* List View - Stacks cleanly into cards on mobile with full-width buttons */}
            {viewMode === "list" && (
              <div className="grid gap-4">
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className={`p-4 sm:p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 transition-all ${
                        order.status === "AWAITING_SLIP"
                          ? "bg-neutral-900/90 border-orange-500/40"
                          : order.status === "CONFIRMED"
                          ? "bg-neutral-900/60 border-emerald-500/30"
                          : "bg-neutral-900/40 border-neutral-800"
                      }`}
                    >
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 mb-2">
                          <span className="text-base sm:text-xl font-black uppercase tracking-wide text-white font-mono">
                            {order.order_number}
                          </span>
                          {order.status === "AWAITING_SLIP" ? (
                            <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 uppercase">
                              <Clock size={12} /> Awaiting Slip
                            </span>
                          ) : order.status === "CONFIRMED" ? (
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 uppercase">
                              <CheckCircle size={12} /> Payment Verified
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[11px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 uppercase">
                              <Package size={12} /> Shipped
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-300 text-sm font-medium">
                          {order.customer_name} •{" "}
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="font-mono text-neutral-400 hover:text-orange-400 underline decoration-dotted transition-colors"
                          >
                            {order.customer_phone}
                          </a>
                        </p>
                        {order.customer_address && (
                          <p className="text-xs text-neutral-500 mt-1">{order.customer_address}</p>
                        )}
                        {order.applied_promo_code && (
                          <p className="text-xs text-neutral-400 mt-1">
                            Trainer Code:{" "}
                            <span className="text-orange-400 font-bold font-mono">
                              {order.applied_promo_code}
                            </span>{" "}
                            <span className="text-emerald-400 font-medium">
                              (+LKR {order.affiliate_commission_amount?.toLocaleString()})
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Amount & Actions - Stacks on mobile with full width */}
                      <div className="flex flex-col sm:flex-row md:flex-row items-stretch sm:items-center justify-between md:justify-end gap-3 sm:gap-6 w-full md:w-auto border-t border-neutral-800/80 pt-4 md:border-t-0 md:pt-0">
                        <div className="flex sm:block justify-between items-center text-left md:text-right">
                          <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                            Amount Due
                          </p>
                          <p className="text-xl sm:text-2xl font-black text-white">
                            LKR {order.total_amount.toLocaleString()}
                          </p>
                        </div>

                        {order.status === "AWAITING_SLIP" && (
                          <button
                            onClick={() => approvePayment(order.id)}
                            className="w-full sm:w-auto min-h-[48px] bg-orange-500 hover:bg-orange-400 active:scale-95 text-neutral-950 font-black px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer touch-manipulation"
                          >
                            <CheckCircle size={18} /> Approve
                          </button>
                        )}
                        {order.status === "CONFIRMED" && (
                          <button
                            onClick={() => markShipped(order.id)}
                            className="w-full sm:w-auto min-h-[48px] bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-bold px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-700 touch-manipulation"
                          >
                            <Package size={18} className="text-orange-400" /> Mark Shipped
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INVENTORY & STOCK TRACKER */}
        {/* ========================================================================= */}
        {adminTab === "inventory" && (
          <AdminInventoryManager
            products={products}
            batches={inventoryBatches}
            onAddProduct={handleAddProduct}
            onRestockProduct={handleRestockProduct}
            onToggleActive={handleToggleActive}
            onNavigateToReports={() => setAdminTab("reports")}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TRAINERS & COMMISSION PAYOUTS (GIVE-OUTS) */}
        {/* ========================================================================= */}
        {adminTab === "trainers" && (
          <AdminTrainerManager
            trainers={trainers}
            payouts={payouts}
            onAddTrainer={handleAddTrainer}
            onEditTrainer={handleEditTrainer}
            onProcessPayout={handleProcessPayout}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: USERS, STAFF PRIVILEGES & TRAINER BANK APPROVAL QUEUE */}
        {/* ========================================================================= */}
        {adminTab === "staff" && (
          <AdminStaffManager
            staffUsers={staffUsers}
            onAddStaffUser={handleAddStaffUser}
            onToggleStaffStatus={handleToggleStaffStatus}
            bankRequests={bankRequests}
            onApproveBankChange={handleApproveBankChange}
            onRejectBankChange={handleRejectBankChange}
            currentStaffUser={currentStaffUser}
            onSwitchStaffUser={handleSwitchStaffUser}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 5: WHOLE SYSTEM PERFORMANCE & PROFIT REPORTS */}
        {/* ========================================================================= */}
        {adminTab === "reports" && (
          <AdminReportsManager
            orders={orders}
            products={products}
            trainers={trainers}
            payouts={payouts}
            batches={inventoryBatches}
          />
        )}
      </div>
    </div>
  );
}
