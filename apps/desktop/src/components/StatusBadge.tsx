import { CircleCheckBig, CircleDotDashed, LoaderCircle, TriangleAlert } from "lucide-react";

interface StatusBadgeProps {
    label: string;
    tone?: "neutral" | "success" | "warning" | "danger" | "active";
}

const iconByTone = {
    neutral: CircleDotDashed,
    success: CircleCheckBig,
    warning: TriangleAlert,
    danger: TriangleAlert,
    active: LoaderCircle,
} as const;

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
    const Icon = iconByTone[tone];

    return (
        <span className={`status-badge status-badge-${tone}`}>
            <Icon
                className={tone === "active" ? "status-badge-icon status-badge-icon-spin" : "status-badge-icon"}
                aria-hidden="true"
            />
            <span>{label}</span>
        </span>
    );
}
