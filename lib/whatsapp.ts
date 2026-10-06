import { CartItem, CustomerDetails } from "./types";
import { formatLKR } from "./utils";

export interface WhatsAppOrderData {
  orderNumber: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  expiresAt: string;
}

export function generateWhatsAppCheckoutUrl(data: WhatsAppOrderData): string {
  const businessPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94771234567";
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Commercial Bank of Ceylon";
  const bankAccountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "SUPPLEMENT FACTORY LK";
  const bankAccountNo = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "8009218274";
  const bankBranch = process.env.NEXT_PUBLIC_BANK_BRANCH || "Colombo Corporate";

  // Expiry time display (4 hours)
  const expiryTime = new Date(data.expiresAt).toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemsList = data.items
    .map(
      (item, i) =>
        `${i + 1}. *${item.product.name}* (x${item.quantity}) - ${formatLKR(
          item.product.price * item.quantity
        )}`
    )
    .join("\n");

  const promoInfo = data.promoCode
    ? `\n🎟️ *Trainer Promo Applied:* ${data.promoCode.toUpperCase()} (-${formatLKR(data.discount)})`
    : "";

  const rawMessage = `*SUPPLEMENT FACTORY SRI LANKA - ORDER #${data.orderNumber}*
⚡ *Stock Reserved for 4 Hours (Expires: ${expiryTime})*
━━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER DETAILS:*
• Name: ${data.customer.name}
• Phone: ${data.customer.phone}
• Delivery Address: ${data.customer.address}, ${data.customer.city} (${data.customer.district})

🛒 *ORDER SUMMARY:*
${itemsList}
${promoInfo}
💰 *TOTAL TO PAY: ${formatLKR(data.total)}*
━━━━━━━━━━━━━━━━━━━━━━
🏦 *BANK TRANSFER PAYMENT DETAILS:*
• Bank: ${bankName}
• Account Name: ${bankAccountName}
• Account Number: *${bankAccountNo}*
• Branch: ${bankBranch}
• Reference: *${data.orderNumber}*

📸 *NEXT STEPS:*
1. Transfer the exact total (*${formatLKR(data.total)}*) using Online Banking / CDM.
2. Send the payment receipt / screenshot in this chat.
3. Your order will be verified and dispatched within 24-48 hours.

_Stock is locked for 4 hours. Unpaid orders are auto-released to the pool._`;

  return `https://wa.me/${businessPhone}?text=${encodeURIComponent(rawMessage)}`;
}
