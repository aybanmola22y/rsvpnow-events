import { format, isValid, parseISO } from "date-fns";

export function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: string) {
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, "MMMM d, yyyy");
}

export function formatDateTime(value: string) {
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, "MMM d, yyyy · h:mm a");
}

export function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours)) return value;
  const date = new Date();
  date.setHours(hours, minutes || 0, 0, 0);
  return format(date, "h:mm a");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uid(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${id}`;
}

export function nextCode(prefix: string, existing: string[], year = new Date().getFullYear()) {
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  const max = existing.reduce((highest, value) => {
    const match = value.match(pattern);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `${prefix}-${year}-${String(max + 1).padStart(5, "0")}`;
}

export function uniqueSlug(base: string, existing: string[]) {
  const root = slugify(base) || "item";
  if (!existing.includes(root)) return root;
  let index = 2;
  while (existing.includes(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

export function hoursBetween(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  if ([startHour, startMinute, endHour, endMinute].some((part) => Number.isNaN(part))) {
    return 0;
  }
  const diff = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
  return diff > 0 ? diff : 0;
}

export function wait(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function packagePrice(price: number, salePrice: number | null) {
  return salePrice != null && salePrice > 0 ? salePrice : price;
}
