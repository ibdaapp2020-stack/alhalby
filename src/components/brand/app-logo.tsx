import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND, type LogoSize } from "@/lib/brand";

export type AppLogoProps = {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
  href?: string | null;
};

const SIZE_CLASS: Record<LogoSize, string> = {
  xs: "h-8 w-auto max-h-8",
  sm: "h-10 w-auto max-h-10 md:h-12 md:max-h-12",
  md: "h-12 w-auto max-h-12",
  lg: "h-14 w-auto max-h-14",
  xl: "h-16 w-auto max-h-16",
};

/**
 * Single source of truth for the active tenant's logo asset.
 * Uses `public/logo.png`.
 */
export function AppLogo({
  size = "md",
  className,
  priority = false,
  href = "/",
}: AppLogoProps) {
  const hasHeight = /\bh-/.test(className ?? "");
  const image = (
    <Image
      src={BRAND.logo}
      alt={BRAND.name}
      width={Math.round(640 * BRAND.logoAspect)}
      height={640}
      sizes="160px"
      priority={priority}
      className={cn("w-auto max-w-none object-contain", !hasHeight && SIZE_CLASS[size], className)}
    />
  );

  if (href !== undefined && href !== null) {
    return (
      <Link
        href={href}
        className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
        aria-label={BRAND.name}
      >
        {image}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0 items-center">{image}</span>;
}
