import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CurrencyDisplay({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return <span className={className}>{formatPeso(value)}</span>;
}
