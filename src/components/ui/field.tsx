import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Label } from "./label";

/** Props a form control needs so its label, description and error are announced together. */
export type FieldControlProps = {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
};

export type FieldProps = {
    label: ReactNode;
    /** Stable control id; generated when omitted. */
    id?: string;
    description?: ReactNode;
    /** Validation message. When set, the control is marked invalid and points at it. */
    error?: ReactNode;
    className?: string;
    /** Render prop so any control (Input, Textarea, …) receives the wiring without cloning. */
    children: (control: FieldControlProps) => ReactNode;
};

/** Label + control + optional description and error, with ids and ARIA wiring (MASTERPLAN §8). */
export function Field({
    label,
    id,
    description,
    error,
    className,
    children,
}: FieldProps): ReactNode {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const descriptionId = description ? `${controlId}-description` : undefined;
    const errorId = error ? `${controlId}-error` : undefined;
    const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    return (
        <div data-slot="field" className={cn("flex flex-col gap-2", className)}>
            <Label htmlFor={controlId}>{label}</Label>
            {children({
                id: controlId,
                "aria-describedby": describedBy,
                "aria-invalid": error ? true : undefined,
            })}
            {description ? (
                <p
                    id={descriptionId}
                    data-slot="field-description"
                    className="text-body text-muted-foreground"
                >
                    {description}
                </p>
            ) : null}
            {error ? (
                <p id={errorId} data-slot="field-error" className="text-body text-destructive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
