import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-ink text-white hover:bg-neutral-800",
  brand: "bg-ink text-white hover:bg-neutral-800",
  outline: "border border-line bg-white text-ink hover:border-ink",
  ghost: "text-ink hover:bg-subtle",
  danger: "text-red-600 hover:bg-red-50",
};

type ButtonProps = ComponentProps<"button"> & { variant?: keyof typeof variants; loading?: boolean; size?: "sm" | "md" | "lg" };

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-none font-medium transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-8 px-3.5 text-[13px]",
        size === "md" && "h-10 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-sm",
        variants[variant],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-ink aria-invalid:border-red-500";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input({ className, ...props }, ref) {
  return <input ref={ref} {...props} className={cn(inputClass, className)} />;
});

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "min-h-28 resize-y", className)} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select {...props} className={cn(inputClass, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%237a7a7a%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)}>
      {children}
    </select>
  );
}

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-[13px] font-medium">{label}</span>
      {children}
      {error ? <span className="block text-xs text-red-600">{error}</span> : hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("rounded-xl border border-line bg-white", className)} />;
}

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} className={cn("inline-flex items-center gap-1 rounded-none border border-line px-2.5 py-0.5 text-xs font-medium", className)} />;
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-xl font-semibold tracking-tight">{children}</h2>
      {aside}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="animate-fade-up flex flex-col items-center px-6 py-20 text-center">
      <div className="mb-4 text-muted [&_svg]:size-6 [&_svg]:stroke-[1.5]">{icon}</div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const linkButton = {
  primary: "inline-flex h-10 items-center gap-2 rounded-none bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800",
  outline: "inline-flex h-10 items-center gap-2 rounded-none border border-line px-5 text-sm font-medium transition-colors hover:border-ink",
};
