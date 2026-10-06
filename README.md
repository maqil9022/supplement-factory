# ⚡ Supplement Factory LK — Hardcore Sports Nutrition & ATP E-Commerce Platform

A production-grade, high-performance sports nutrition and bodybuilding supplement e-commerce platform engineered specifically for the Sri Lankan fitness market. Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase PostgreSQL**.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ Architecture & Tech Stack](#️-architecture--tech-stack)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Backend Setup](#3-backend-setup)
- [📁 Project Structure](#-project-structure)
- [🔒 Security & Privacy Notice](#-security--privacy-notice)

---

## ✨ Key Features

### 🛒 Frictionless WhatsApp Bank Checkout
- **4-Hour Available-To-Promise (ATP) Stock Hold:** Reserving inventory in cart temporarily locks warehouse stock for 4 hours to eliminate inventory sniping.
- **Direct Local Bank Wire:** Formatted for Commercial Bank of Ceylon, BOC, and Sampath Bank with 1-tap account number copying.
- **Instant WhatsApp Slip Dispatch:** Auto-generates structured WhatsApp order messages with itemized breakdowns, total amount due, and transfer instructions for same-day manual verification.

### 🏋️ Coach & Gym Affiliate Network Engine
- **Affiliate Commission Tracking:** Certified fitness trainers receive unique promo codes offering **5% discounts** to gym members while accumulating a **10% cash commission**.
- **Coach Portal (`/trainer`):** Dedicated portal for coaches to monitor lifetime earnings, pending balances, recent referred orders, and submit secure bank account change requests.
- **Interactive Breakdown Simulator:** Real-time customer discount and trainer commission calculators.

### 🛡️ Administrative Command Center (`/admin`)
- **Visual Order Kanban:** Real-time order status tracking (`AWAITING_SLIP` ➔ `CONFIRMED` ➔ `SHIPPED`).
- **Granular Staff RBAC:** Multi-tier role permissions (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `FINANCE`, `DISPATCH_STAFF`).
- **Warehouse Batch Tracking:** Batch-level cost and selling price tracking with landed margin calculations.
- **Profit Intelligence:** Real-time metrics for Gross Revenue, Estimated COGS, Affiliate Expenses, and Net Margins.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3 (App Router, Turbopack) | Server Components & Client Component Hydration |
| **UI Library** | React 19 | High-efficiency reactive state management & hooks |
| **Language** | TypeScript 5 | Strict static typing and type safety |
| **Styling** | Tailwind CSS v4 | Carbon-mesh gritty dark mode aesthetics |
| **Animations** | Framer Motion | Smooth 60fps micro-interactions and drawer transitions |
| **Icons** | Lucide React | Modern geometric iconography |
| **Database** | Supabase PostgreSQL | Relational schema with Row Level Security (RLS) |
| **Realtime** | Supabase Realtime | Live order dispatch listeners over WebSockets |
| **Deployment** | Netlify / Vercel | Production edge hosting and automated CI/CD |

---

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/maqil9022/supplement-factory.git
cd supplement-factory
```

### 2. Frontend Setup

Install the required npm dependencies:

```bash
npm install
```

Configure your local environment variables by copying `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Fill in your configuration in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Sri Lankan Store Configuration
NEXT_PUBLIC_WHATSAPP_NUMBER=94771234567
NEXT_PUBLIC_BRAND_NAME=SUPPLEMENT FACTORY LK
NEXT_PUBLIC_CURRENCY=LKR

# Bank Details for WhatsApp Checkout
NEXT_PUBLIC_BANK_NAME=Commercial Bank of Ceylon
NEXT_PUBLIC_BANK_ACCOUNT_NAME=SUPPLEMENT FACTORY LK
NEXT_PUBLIC_BANK_ACCOUNT_NO=8009218274
NEXT_PUBLIC_BANK_BRANCH=Colombo Corporate Branch
```

Start the local development server:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 3. Backend Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. This initializes:
   - Tables: `products`, `orders`, `order_items`, `affiliates`, `affiliate_payouts`, `staff_users`, `inventory_batches`.
   - Automated Stock Holds & Expiration Triggers.
   - Row Level Security (RLS) policies.
   - Initial Sri Lanka product catalog seed data.

---

## 📁 Project Structure

```text
supplement-factory/
├── app/
│   ├── admin/
│   │   └── page.tsx              # Operations Command Center (Staff Kanban & Inventory)
│   ├── trainer/
│   │   └── page.tsx              # Coach Affiliate Portal & Payout Tracker
│   ├── globals.css               # Tailwind CSS v4 carbon styling & gradients
│   ├── layout.tsx                # Root layout with SEO meta & Geist font definitions
│   └── page.tsx                  # Customer-facing storefront & parallax product stage
├── components/
│   ├── AdminInventoryManager.tsx # Warehouse batch entry, unit costs, and reorder levels
│   ├── AdminKanbanPreview.tsx    # Live slip verification & courier dispatch boards
│   ├── AdminReportsManager.tsx   # Revenue, estimated COGS, and net margin intelligence
│   ├── AdminStaffManager.tsx     # Role-based privileges & trainer bank change queue
│   ├── AdminTrainerManager.tsx   # Trainer directory & commission settlement ledger
│   ├── CheckoutDrawer.tsx        # Slide-over checkout with 4-hour reservation hold
│   ├── CustomerHowToOrder.tsx    # 4-step WhatsApp bank transfer explainer
│   ├── CustomerTrainerPromoBanner.tsx # Interactive trainer discount code verifier
│   ├── Navbar.tsx                # Sticky top bar with mobile navigation drawer
│   ├── ProductCard.tsx           # ATP inventory badges and product detail card
│   └── TrainerAffiliateWidget.tsx# Real-time checkout discount & commission simulator
├── lib/
│   ├── supabase.ts               # Supabase client instantiation & fallback seed data
│   ├── types.ts                  # Domain models (Products, Orders, ATP, Affiliates, Staff)
│   ├── utils.ts                  # LKR currency formatting & pure order generators
│   └── whatsapp.ts               # URL serializer for encoded WhatsApp orders
├── supabase/
│   └── schema.sql                # Complete PostgreSQL schema, RLS, functions & triggers
├── .env.local.example            # Environment variables template
├── .gitignore                    # Secrets & build artifact exclusion
├── next.config.ts                # Next.js configuration & image remote patterns
├── package.json                  # Dependencies & execution scripts
└── tsconfig.json                 # TypeScript strict compiler configuration
```

---

## 🔒 Security & Privacy Notice

- **Zero Secret Exposure:** `.env.local` is strictly excluded in `.gitignore` to prevent leaking API keys and database credentials to GitHub.
- **Row Level Security (RLS):** All Supabase database tables enforce strict RLS policies. Client queries through the anonymous key cannot manipulate stock levels, view unassigned trainer payouts, or access internal staff records.
- **Sanitized Inputs:** All order IDs, phone numbers, and WhatsApp messages are properly encoded to prevent injection attacks and client-side parameter tampering.
- **Stock Lock Idempotency:** The database Available-To-Promise (ATP) engine uses atomic row locks (`FOR UPDATE`) to prevent race conditions and inventory overselling during simultaneous checkouts.
