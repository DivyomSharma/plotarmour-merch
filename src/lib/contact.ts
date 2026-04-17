export const MERCH_EMAIL = "merch@theplotarmour.store";

export function buildWhatsAppLink(message: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");

  if (!phone) {
    return `mailto:${MERCH_EMAIL}?subject=${encodeURIComponent(
      "Bulk merch enquiry",
    )}&body=${encodeURIComponent(message)}`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
