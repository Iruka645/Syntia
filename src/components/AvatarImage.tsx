"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  loading?: "eager" | "lazy";
  children: ReactNode;
}

export function AvatarImage({ src, alt, sizes, className, loading, children }: AvatarImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const canRenderImage = Boolean(src) && failedSrc !== src;

  return (
    <>
      {children}
      {canRenderImage && src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={className}
          loading={loading}
          onError={() => setFailedSrc(src)}
        />
      )}
    </>
  );
}
