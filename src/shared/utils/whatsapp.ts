/**
 * Utility functions for WhatsApp formatting and link generation
 */

/**
 * Normalizes any Indonesian phone number format into standard international format without '+' (e.g. '6281234567890').
 * Handles variations:
 * - Local prefix: '081234567890' -> '6281234567890'
 * - Standard +62: '+6281234567890' -> '6281234567890'
 * - Formatted with symbols: '+62 812-3456-7890' -> '6281234567890'
 * - Accidental double prefix: '62081234567890' -> '6281234567890'
 * - Missing prefix: '81234567890' -> '6281234567890'
 */
export function normalizeWhatsAppNumber(
  phone: string | null | undefined,
): string {
  if (!phone) return "";

  // Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "";

  // Handle accidental '6208...' or '620...' (e.g. user typed '+62 0812...')
  if (cleaned.startsWith("6208")) {
    cleaned = "62" + cleaned.slice(3);
  } else if (cleaned.startsWith("620")) {
    cleaned = "62" + cleaned.slice(3);
  }
  // Handle local prefix '08...' or '0...'
  else if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  // Handle missing prefix '8...'
  else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }

  // Indonesian mobile numbers should start with '62' and have at least 9 digits
  if (!cleaned.startsWith("62") || cleaned.length < 9) {
    return "";
  }

  return cleaned;
}

/**
 * Backward-compatible alias for normalizeWhatsAppNumber
 */
export function formatWhatsAppNumber(phone: string | null | undefined): string {
  return normalizeWhatsAppNumber(phone);
}

/**
 * Creates a direct `https://wa.me/<number>?text=<message>` URL.
 * Automatically normalizes the phone number and URI-encodes the message.
 * Returns empty string if phone number is empty/invalid.
 */
export function createWhatsAppLink(
  phone: string | null | undefined,
  message?: string,
): string {
  const formattedPhone = normalizeWhatsAppNumber(phone);
  if (!formattedPhone) return "";
  const encodedMsg = message ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${formattedPhone}${encodedMsg}`;
}

