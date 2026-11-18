import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

import type { ContentImage } from "@/types/content";
import { cn } from "@/lib/cn";

// Overlapping round avatars. Each avatar is pulled left so 32 px faces sit 24 px apart (hero)
// and 40 px faces 32 px apart (CTA band), as in the Figma frames.
const avatarVariants = cva("relative overflow-hidden rounded-full border-2 bg-secondary", {
    variants: {
        size: {
            sm: "size-8 not-first:-ml-2",
            md: "size-10 not-first:-ml-2",
        },
        ring: {
            muted: "border-muted",
            accent: "border-accent",
        },
    },
    defaultVariants: {
        size: "sm",
        ring: "muted",
    },
});

const pixelSize = { sm: 32, md: 40 } as const;

export type AvatarStackProps = Omit<ComponentProps<"div">, "children"> &
    VariantProps<typeof avatarVariants> & {
        avatars: readonly ContentImage[];
    };

export function AvatarStack({
    avatars,
    size,
    ring,
    className,
    ...props
}: AvatarStackProps): ReactNode {
    const px = pixelSize[size ?? "sm"];

    return (
        <div data-slot="avatar-stack" className={cn("flex", className)} {...props}>
            {avatars.map((avatar) => (
                <span key={avatar.src} className={avatarVariants({ size, ring })}>
                    <Image
                        src={avatar.src}
                        alt={avatar.alt}
                        width={px}
                        height={px}
                        sizes={`${px}px`}
                        className="size-full object-cover"
                    />
                </span>
            ))}
        </div>
    );
}
