/** A local image under `public/` with its intrinsic size (used by `next/image`). */
export type ContentImage = {
    src: string;
    /** Empty string marks the image as decorative. */
    alt: string;
    width: number;
    height: number;
};

/** A call-to-action rendered as a link styled like a button. */
export type ContentLink = {
    label: string;
    href: string;
};
