"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StaffUser,
  StaffRole,
  StaffPrivileges,
  CreateStaffUserInput,
  TrainerBankChangeRequest,
} from "@/lib/types";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  X,
  Lock,
  ArrowRight,
  Clock,
  Check,
  Key,
  CreditCard,
  UserPlus,
} from "lucide-react";

interface AdminStaffManagerProps {
  staffUsers: StaffUser[];
  onAddStaffUser: (input: CreateStaffUserInput) => void;
  onToggleStaffStatus: (userId: string, isActive: boolean) => void;
  bankRequests: TrainerBankChangeRequest[];
  onApproveBankChange: (requestId: string) => void;
  onRejectBankChange: (requestId: string, reason: string) => void;
  currentStaffUser: StaffUser;
  onSwitchStaffUser: (user: StaffUser) => void;
}

const DEFAULT_PRIVILEGES_BY_ROLE: Record<StaffRole, StaffPrivileges> = {
  SUPER_ADMIN: {
    can_approve_bank_changes: true,
    can_process_payouts: true,
    can_manage_inventory: true,
    can_manage_staff: true,
    can_verify_orders: true,
    can_view_financials: true,
  },
  OPERATIONS_MANAGER: {
    can_approve_bank_changes: true,
    can_process_payouts: true,
    can_manage_inventory: true,
    can_manage_staff: false,
    can_verify_orders: true,
    can_view_financials: true,
  },
  FINANCE: {
    can_approve_bank_changes: true,
    can_process_payouts: true,
    can_manage_inventory: false,
    can_manage_staff: false,
    can_verify_orders: true,
    can_view_financials: true,
  },
  DISPATCH_STAFF: {
    can_approve_bank_changes: false,
    can_process_payouts: false,
    can_manage_inventory: true,
    can_manage_staff: false,
    can_verify_orders: true,
    can_view_financials: false,
  },
};

export function AdminStaffManager({
  staffUsers,
  onAddStaffUser,
  onToggleStaffStatus,
  bankRequests,
  onApproveBankChange,
  onRejectBankChange,
  currentStaffUser,
  onSwitchStaffUser,
}: AdminStaffManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"approvals" | "users">("approvals");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // New staff form state
  const [formData, setFormData] = useState<CreateStaffUserInput>({
    name: "",
    email: "",
    role: "OPERATIONS_MANAGER",
    phone: "",
    password: "staff@pass2026",
    privileges: { ...DEFAULT_PRIVILEGES_BY_ROLE.OPERATIONS_MANAGER },
  });

  const handleRoleChange = (newRole: StaffRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      privileges: { ...DEFAULT_PRIVILEGES_BY_ROLE[newRole] },
    }));
  };

  const handlePrivilegeToggle = (key: keyof StaffPrivileges) => {
    setFormData((prev) => ({
      ...prev,
      privileges: {
        ...prev.privileges,
        [key]: !prev.privileges[key],
      },
    }));
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please provide staff name and official email.");
      return;
    }
    onAddStaffUser(formData);
    setIsAddUserModalOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "OPERATIONS_MANAGER",
      phone: "",
      password: "staff@pass2026",
      privileges: { ...DEFAULT_PRIVILEGES_BY_ROLE.OPERATIONS_MANAGER },
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequestId) return;
    onRejectBankChange(rejectingRequestId, rejectReason || "Bank account details could not be verified with branch.");
    setRejectingRequestId(null);
    setRejectReason("");
  };

  const pendingRequests = bankRequests.filter((r) => r.status === "PENDING");
  const resolvedRequests = bankRequests.filter((r) => r.status !== "PENDING");

  const canApprove =
    currentStaffUser.privileges.can_approve_bank_changes ||
    currentStaffUser.role === "SUPER_ADMIN" ||
    currentStaffUser.role === "OPERATIONS_MANAGER";

  return (
    <div className="space-y-6">
      {/* Top Banner: Active Operator Context & Role Switcher */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400 mb-1">
            <ShieldCheck size={16} />
            <span>Active Operator Privilege Context</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>{currentStaffUser.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500/10 border border-orange-500/30 text-orange-400">
              {currentStaffUser.role.replace(/_/g, " ")}
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Logged in as <strong className="text-neutral-200">{currentStaffUser.email}</strong> •{" "}
            {canApprove ? (
              <span className="text-emerald-400 font-bold">Authorized to Approve Bank Changes & Give-Outs</span>
            ) : (
              <span className="text-amber-400 font-bold">Read-Only for Sensitive Bank Approvals</span>
            )}
          </p>
        </div>

        {/* Quick Operator Switcher for Demo / Multi-Role Testing */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">Switch Operator:</span>
          <select
            value={currentStaffUser.id}
            onChange={(e) => {
              const found = staffUsers.find((s) => s.id === e.target.value);
              if (found) onSwitchStaffUser(found);
            }}
            className="rounded-lg border border-neutral-700 bg-black/80 px-3 py-2 text-xs font-bold text-white focus:border-orange-500 focus:outline-none"
          >
            {staffUsers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role.replace(/_/g, " ")})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs: Approvals Queue vs Staff Directory */}
      <div className="flex flex-wrap border-b border-neutral-800 gap-2">
        <button
          onClick={() => setActiveSubTab("approvals")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === "approvals"
              ? "border-orange-500 text-orange-400 bg-neutral-900/60"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <CreditCard size={15} />
          <span>Trainer Bank Approval Queue ({pendingRequests.length})</span>
          {pendingRequests.length > 0 && (
            <span className="h-5 w-5 rounded-full bg-orange-500 text-black text-[10px] font-black flex items-center justify-center animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === "users"
              ? "border-orange-500 text-orange-400 bg-neutral-900/60"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Users size={15} />
          <span>Staff Accounts & Privileges ({staffUsers.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TRAINER BANK APPROVAL QUEUE */}
      {/* ========================================================================= */}
      {activeSubTab === "approvals" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Pending Trainer Bank Account Modifications
              </h3>
              <p className="text-xs text-neutral-400">
                To prevent fraud and misrouted commission wires, bank account modifications submitted by coaches require authorization from a Manager or Super Admin before taking effect.
              </p>
            </div>
          </div>

          {/* Pending Requests List */}
          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-10 text-center text-neutral-500">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase">All Bank Modification Requests Processed</h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                No pending bank account change submissions. When gym coaches update their accounts via the Trainer Portal, they will appear here for verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-amber-500/40 bg-neutral-900/80 p-6 shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-neutral-800 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Awaiting Manager Approval
                        </span>
                        <span className="font-mono text-xs text-neutral-400">
                          {new Date(req.created_at).toLocaleString("en-LK")}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white mt-1">
                        Coach {req.trainer_name}
                      </h4>
                      {req.reason && (
                        <p className="text-xs text-neutral-300 italic mt-0.5">
                          &ldquo;{req.reason}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-3">
                      {canApprove ? (
                        <>
                          <button
                            onClick={() => onApproveBankChange(req.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
                          >
                            <CheckCircle2 size={16} />
                            <span>Approve & Update Live Account</span>
                          </button>

                          <button
                            onClick={() => setRejectingRequestId(req.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-800/60 bg-red-950/40 hover:bg-red-950/70 text-red-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <XCircle size={16} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-xs font-bold text-amber-400 bg-amber-950/30 border border-amber-800/40 px-3 py-2 rounded-lg flex items-center gap-2">
                          <Lock size={14} />
                          <span>Requires Manager or Super Admin role to approve</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Side-by-Side Account Diff Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Current Account */}
                    <div className="rounded-xl border border-neutral-800 bg-black/60 p-4 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                        Current Active Bank Details
                      </span>
                      <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                        <span className="text-neutral-400">Bank:</span>
                        <span className="font-bold text-neutral-300">{req.current_bank_name || "None"}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                        <span className="text-neutral-400">Branch:</span>
                        <span className="font-bold text-neutral-300">{req.current_bank_branch || "None"}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                        <span className="text-neutral-400">Account No:</span>
                        <span className="font-mono font-bold text-neutral-300">{req.current_bank_account_no || "None"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Account Name:</span>
                        <span className="font-bold text-neutral-300">{req.current_bank_account_name || "None"}</span>
                      </div>
                    </div>

                    {/* Requested New Account */}
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block flex items-center justify-between">
                        <span>Requested New Bank Details</span>
                        <span className="text-emerald-300 text-[10px] font-bold">New Target</span>
                      </span>
                      <div className="flex justify-between border-b border-emerald-900/40 pb-1.5">
                        <span className="text-neutral-400">Bank:</span>
                        <span className="font-bold text-white">{req.requested_bank_name}</span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-900/40 pb-1.5">
                        <span className="text-neutral-400">Branch:</span>
                        <span className="font-bold text-white">{req.requested_bank_branch}</span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-900/40 pb-1.5">
                        <span className="text-neutral-400">Account No:</span>
                        <span className="font-mono font-black text-emerald-300">{req.requested_bank_account_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Account Name:</span>
                        <span className="font-bold text-white">{req.requested_bank_account_name}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Historical Processed Log */}
          {resolvedRequests.length > 0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 mt-8">
              <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-3">
                Audit Trail: Recently Decided Bank Changes ({resolvedRequests.length})
              </h4>
              <div className="space-y-2 text-xs">
                {resolvedRequests.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-black/40 border border-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white">{r.trainer_name}</span>
                      <span className="text-neutral-400 ml-2">
                        → {r.requested_bank_name} ({r.requested_bank_account_no})
                      </span>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        Reviewed by: {r.reviewed_by || "Manager"} on{" "}
                        {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString("en-LK") : "-"}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                          r.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STAFF USERS DIRECTORY & RBAC PRIVILEGES */}
      {/* ========================================================================= */}
      {activeSubTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Staff Accounts & Role Privileges (RBAC)
              </h3>
              <p className="text-xs text-neutral-400">
                Grant or restrict operational permissions for slip verification, warehouse stock restocking, and trainer payouts.
              </p>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-95"
            >
              <UserPlus size={16} />
              <span>Create Staff Account</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/50">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[11px] font-black uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Active Privileges</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {staffUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-900/80 transition-colors">
                    {/* Member */}
                    <td className="p-4">
                      <div className="font-black text-white text-sm">{user.name}</div>
                      <div className="text-[11px] text-neutral-400">{user.email}</div>
                      {user.phone && (
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{user.phone}</div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-neutral-800 text-orange-400 border border-neutral-700">
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Granular Privileges Badges */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {user.privileges.can_approve_bank_changes && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✓ Approve Bank Details
                          </span>
                        )}
                        {user.privileges.can_process_payouts && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✓ Settle Payouts
                          </span>
                        )}
                        {user.privileges.can_manage_inventory && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-800 text-neutral-300">
                            ✓ Restock Stock
                          </span>
                        )}
                        {user.privileges.can_verify_orders && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-800 text-neutral-300">
                            ✓ Verify Slips
                          </span>
                        )}
                        {user.privileges.can_manage_staff && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            ★ Manage Staff
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          user.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {user.is_active ? <UserCheck size={12} /> : <UserX size={12} />}
                        {user.is_active ? "Active Staff" : "Suspended"}
                      </span>
                    </td>

                    {/* Toggle Status */}
                    <td className="p-4 text-right">
                      {user.role !== "SUPER_ADMIN" ? (
                        <button
                          onClick={() => onToggleStaffStatus(user.id, !user.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer border ${
                            user.is_active
                              ? "border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white"
                              : "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                          }`}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-mono">Protected Root</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW STAFF USER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddUserModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-black uppercase text-white">
                    Create New Staff User Account
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-400">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kasun Jayawardena"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400">Official Staff Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kasun@supplementfactory.lk"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-400">Primary Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="OPERATIONS_MANAGER">Operations Manager</option>
                      <option value="FINANCE">Finance & Accounts Lead</option>
                      <option value="DISPATCH_STAFF">Dispatch & Warehouse Executive</option>
                      <option value="SUPER_ADMIN">Super Admin (Managing Director)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-400">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+94771234567"
                      className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 font-mono text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-400">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2.5 font-mono text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Granular Privilege Toggles */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
                  <span className="text-[11px] font-black uppercase text-orange-400 block">
                    Assigned Permission Privileges
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-neutral-800/60">
                      <input
                        type="checkbox"
                        checked={formData.privileges.can_approve_bank_changes}
                        onChange={() => handlePrivilegeToggle("can_approve_bank_changes")}
                        className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                      />
                      <span>Approve Trainer Bank Details</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-neutral-800/60">
                      <input
                        type="checkbox"
                        checked={formData.privileges.can_process_payouts}
                        onChange={() => handlePrivilegeToggle("can_process_payouts")}
                        className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                      />
                      <span>Process Commission Payouts</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-neutral-800/60">
                      <input
                        type="checkbox"
                        checked={formData.privileges.can_manage_inventory}
                        onChange={() => handlePrivilegeToggle("can_manage_inventory")}
                        className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                      />
                      <span>Restock & Add Inventory</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-neutral-800/60">
                      <input
                        type="checkbox"
                        checked={formData.privileges.can_verify_orders}
                        onChange={() => handlePrivilegeToggle("can_verify_orders")}
                        className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                      />
                      <span>Verify Slips & Dispatch</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-neutral-800/60">
                      <input
                        type="checkbox"
                        checked={formData.privileges.can_view_financials}
                        onChange={() => handlePrivilegeToggle("can_view_financials")}
                        className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                      />
                      <span>View Warehouse Cost & Margins</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-neutral-800/60">
                      <input
                        type="checkbox"
                        checked={formData.privileges.can_manage_staff}
                        onChange={() => handlePrivilegeToggle("can_manage_staff")}
                        className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                      />
                      <span className="font-bold text-orange-400">Manage Staff Accounts</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 hover:bg-orange-400 py-3 text-xs font-black uppercase tracking-wider text-black transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer mt-4"
                >
                  Save & Provision Staff User
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT REQUEST REASON DIALOG */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rejectingRequestId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingRequestId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle size={18} />
                  <h4 className="text-sm font-black uppercase text-white">
                    Reject Bank Account Change
                  </h4>
                </div>
                <button
                  onClick={() => setRejectingRequestId(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-neutral-400 block mb-1">
                    Reason for Rejection (Displayed to Coach in Portal):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Account number could not be validated with branch. Please provide official bank statement proof."
                    className="w-full rounded-lg border border-neutral-700 bg-black/60 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingRequestId(null)}
                    className="w-1/2 rounded-lg bg-neutral-800 hover:bg-neutral-700 py-2.5 font-bold uppercase text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-lg bg-red-600 hover:bg-red-500 py-2.5 font-black uppercase text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
