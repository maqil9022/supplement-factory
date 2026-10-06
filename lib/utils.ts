import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLKR(amount: number | null | undefined): string {
  const safeAmount = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(safeAmount).replace("LKR", "Rs.");
}

export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SF-${dateStr}-${randomSuffix}`;
}

export function generateOrderExpiryTime(hoursAhead: number = 4): string {
  return new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString();
}
