import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Kit } from "@/lib/kits";

export function KitImage({
  kit,
  priority = false,
}: {
  kit: Kit;
  priority?: boolean;
}) {
  const hasImage = existsSync(
    path.join(process.cwd(), "public", kit.coverImage),
  );

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_top_right,_color-mix(in_srgb,var(--accent)_42%,transparent),_transparent_45%),linear-gradient(135deg,var(--surface-elevated),var(--surface))]">
      {hasImage ? (
        <Image
          src={kit.coverImage}
          alt={`${kit.name} illustrative kit`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_42%,color-mix(in_srgb,var(--foreground)_7%,transparent)_42%,color-mix(in_srgb,var(--foreground)_7%,transparent)_44%,transparent_44%)]"
          aria-label={`${kit.name} image will be added soon`}
          role="img"
        />
      )}
    </div>
  );
}
