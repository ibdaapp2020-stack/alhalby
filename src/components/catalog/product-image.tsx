"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Candy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import { hasRealProductImage, normalizeImageUrl } from "@/lib/menu/placeholders";

interface ProductImageProps {
  image?: string | null;
  categoryId?: string;
  alt: string;
  compact?: boolean;
  thumbnail?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

function isFirebaseUrl(url: string): boolean {
  return (
    url.includes("firebasestorage.googleapis.com") ||
    url.includes("firebasestorage.app")
  );
}

function ProductImagePlaceholder({ className, compact }: { className?: string; compact?: boolean }) {
  const t = useT();
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#F3EBDD] px-3 text-center text-[#6E2132]",
        className
      )}
    >
      <Candy className={cn("text-[#6E2132]/70", compact ? "h-5 w-5" : "h-8 w-8")} strokeWidth={1.5} />
      {!compact && (
        <span className="max-w-[12rem] text-[11px] font-medium leading-snug text-[#6B5346]">
          {t("catalog.photoSoon", "ستُضاف الصورة قريباً")}
        </span>
      )}
    </div>
  );
}

export function ProductImage({
  image,
  alt,
  compact,
  thumbnail,
  sizes,
  priority,
  className,
}: ProductImageProps) {
  const hasImage = hasRealProductImage(image);
  const [src, setSrc] = useState(hasImage ? normalizeImageUrl(image)! : "");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const next = hasRealProductImage(image) ? normalizeImageUrl(image)! : "";
    setSrc(next);
    setLoaded(false);
    setFailed(false);
  }, [image]);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  if (!src || failed) {
    return <ProductImagePlaceholder className={className} compact={compact || thumbnail} />;
  }

  const resolvedSizes =
    sizes ??
    (thumbnail ? "56px" : compact ? "220px" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px");

  const useUnoptimized = isFirebaseUrl(src);

  return (
    <>
      {!loaded && <Skeleton className={cn("absolute inset-0 rounded-none", className)} />}
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        unoptimized={useUnoptimized}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={resolvedSizes}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={cn(
          "object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </>
  );
}
