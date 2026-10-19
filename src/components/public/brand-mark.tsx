import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
  inverted?: boolean;
};

/** Wordmark + tagline. Drop a file at `/public/brand/logo.svg` and switch `useImage` when you have the real asset. */
export function BrandMark({
  className,
  markClassName,
  showTagline = true,
  inverted = false,
}: BrandMarkProps) {
  const useImage = false;

  return (
    <span className={cn("inline-flex min-w-0 flex-col", className)}>
      {useImage ? (
        <img
          src="/brand/logo.svg"
          alt="RSVPNow"
          width={160}
          height={36}
          className={cn(
            "h-8 w-auto md:h-9",
            inverted && "brightness-0 invert",
            markClassName,
          )}
        />
      ) : (
        <span
          className={cn(
            "font-display text-[1.75rem] leading-none tracking-tight md:text-[2rem]",
            inverted ? "text-white" : "text-ink",
            markClassName,
          )}
        >
          RSVPNow
        </span>
      )}
      {showTagline ? (
        <span
          className={cn(
            "mt-1 block text-[10px] tracking-[0.22em] uppercase",
            inverted ? "text-white/55" : "text-stone-500",
          )}
        >
          Events by Nova North
        </span>
      ) : null}
    </span>
  );
}
