import { cn } from "@/lib/utils";

export const ADMIN_LOGO_SRC = "/novasafe-admin-logo.png";

const sizeClass = {
  xs: "h-6 w-6",
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
} as const;

type LogoSize = keyof typeof sizeClass;

export function AdminLogo({
  size = "md",
  className,
}: {
  size?: LogoSize;
  className?: string;
}) {
  return (
    <img
      src={ADMIN_LOGO_SRC}
      alt="NovaSafe Admin"
      width={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 36 : size === "sm" ? 28 : 24}
      height={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 36 : size === "sm" ? 28 : 24}
      className={cn("object-contain shrink-0", sizeClass[size], className)}
      decoding="async"
    />
  );
}

export function AdminBrand({
  showText = true,
  subtitle = "Admin",
  size = "sm",
  textClassName,
}: {
  showText?: boolean;
  subtitle?: string;
  size?: LogoSize;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 overflow-hidden", textClassName)}>
      <AdminLogo size={size} />
      {showText && (
        <div className="leading-tight text-left min-w-0">
          <div className="font-semibold text-foreground text-[14px] truncate">NovaSafe</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
