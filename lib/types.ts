export type OrderStatus =
  | "AWAITING_SLIP"
  | "CONFIRMED"
  | "SHIPPED"
  | "CANCELLED"
  | "EXPIRED"
  | "awaiting_payment"
  | "confirmed"
  | "shipped"
  | "cancelled"
  | "expired";

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  flavor?: string;
  size_weight?: string;
  price: number;
  cost_price?: number;
  stock: number;
  reserved_stock: number;
  description: string;
  nutrition_facts?: Record<string, string | number>;
  image_url: string;
  badge?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  category: string;
  flavor?: string;
  size_weight?: string;
  price: number;
  cost_price: number;
  stock: number;
  description: string;
  image_url: string;
  badge?: string;
  nutrition_facts?: Record<string, string | number>;
}

export interface RestockBatchInput {
  productId: string;
  quantityToAdd: number;
  unitCostPrice: number;
  newSellingPrice?: number;
  batchNumber?: string;
  supplierName?: string;
  notes?: string;
}

export interface InventoryBatch {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity_added: number;
  unit_cost_price: number;
  total_cost: number;
  selling_price: number;
  batch_number?: string;
  supplier_name?: string;
  notes?: string;
  created_at: string;
}

export interface Affiliate {
  id: string;
  user_id?: string;
  email?: string;
  password?: string;
  trainer_name: string;
  gym_name?: string;
  promo_code: string;
  discount_percent: number;
  commission_rate: number;
  total_earnings: number;
  unpaid_balance: number;
  phone: string;
  bank_name?: string;
  bank_branch?: string;
  bank_account_no?: string;
  bank_account_name?: string;
  is_active: boolean;
  created_at?: string;
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  trainer_name?: string;
  amount: number;
  bank_reference: string;
  bank_name?: string;
  bank_account_no?: string;
  notes?: string;
  status: "completed" | "processing";
  created_at: string;
}

export interface CreateTrainerInput {
  trainer_name: string;
  email?: string;
  password?: string;
  gym_name: string;
  promo_code: string;
  discount_percent: number;
  commission_rate: number;
  phone: string;
  bank_name: string;
  bank_branch: string;
  bank_account_no: string;
  bank_account_name: string;
}

export interface UpdateTrainerInput {
  id: string;
  trainer_name: string;
  email?: string;
  password?: string;
  gym_name: string;
  promo_code: string;
  discount_percent: number;
  commission_rate: number;
  phone: string;
  bank_name: string;
  bank_branch: string;
  bank_account_no: string;
  bank_account_name: string;
  is_active: boolean;
}

export interface ProcessPayoutInput {
  affiliate_id: string;
  amount: number;
  bank_reference: string;
  notes?: string;
}

export type StaffRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_MANAGER"
  | "FINANCE"
  | "DISPATCH_STAFF";

export interface StaffPrivileges {
  can_approve_bank_changes: boolean;
  can_process_payouts: boolean;
  can_manage_inventory: boolean;
  can_manage_staff: boolean;
  can_verify_orders: boolean;
  can_view_financials: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  phone?: string;
  is_active: boolean;
  privileges: StaffPrivileges;
  last_login?: string;
  created_at: string;
}

export interface CreateStaffUserInput {
  name: string;
  email: string;
  role: StaffRole;
  phone?: string;
  password?: string;
  privileges: StaffPrivileges;
}

export type TrainerRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TrainerBankChangeRequest {
  id: string;
  affiliate_id: string;
  trainer_name: string;
  current_bank_name: string;
  current_bank_branch: string;
  current_bank_account_no: string;
  current_bank_account_name: string;
  requested_bank_name: string;
  requested_bank_branch: string;
  requested_bank_account_no: string;
  requested_bank_account_name: string;
  requested_phone?: string;
  reason?: string;
  status: TrainerRequestStatus;
  reviewed_by?: string;
  reviewed_by_role?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface CreateTrainerBankChangeInput {
  affiliate_id: string;
  requested_bank_name: string;
  requested_bank_branch: string;
  requested_bank_account_no: string;
  requested_bank_account_name: string;
  requested_phone?: string;
  reason?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_details: CustomerDetails;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  applied_promo_code?: string;
  affiliate_id?: string;
  affiliate_commission_amount: number;
  bank_slip_url?: string;
  whatsapp_uri?: string;
  expires_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
