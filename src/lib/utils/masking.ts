/**
 * Masks an email address by showing only the first and last characters of the local part.
 * Example: john.doe@example.com -> j******e@example.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "N/A";
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

/**
 * Masks a phone number by showing only the last 4 digits.
 * Example: +8801712345678 -> +***********5678
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "N/A";
  if (phone.length <= 4) return "****";
  return "*".repeat(phone.length - 4) + phone.slice(-4);
}

/**
 * Masks a name by showing only the first character.
 * Example: John Doe -> J*** D**
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return "N/A";
  return name
    .split(" ")
    .map((part) => (part.length > 0 ? part[0] + "*".repeat(part.length - 1) : ""))
    .join(" ");
}
