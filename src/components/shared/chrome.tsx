import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-medium text-neutral-400">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950">{title}</h1>
        {description ? <p className="mt-1 max-w-xl text-sm text-neutral-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-5 md:px-8", className)}>{children}</div>;
}

export const adminControlClass = "h-10 w-full bg-white";
export const publicControlClass =
  "h-12 w-full rounded-none border-stone-300 bg-white px-3 text-base shadow-none";
export const publicButtonClass =
  "h-12 rounded-none px-7 text-[11px] font-medium tracking-[0.18em] uppercase";
