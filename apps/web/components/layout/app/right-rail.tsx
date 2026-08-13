const rightItems = [
    { label: "Activity", value: "Updated just now" },
    { label: "Members", value: "18 online" },
    { label: "Queue", value: "3 waiting" },
];

export function RightRail() {
    return (
        <aside className="border-border/70 bg-muted/15 flex h-full min-h-0 flex-col overflow-hidden rounded-xl border p-4">
            <div className="mb-4 shrink-0">
                <div className="text-sm font-semibold">Reserved</div>
                <div className="text-muted-foreground text-xs">Right rail for context</div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {rightItems.map((item) => (
                    <div key={item.label} className="border-border/60 bg-background rounded-lg border p-3">
                        <div className="text-muted-foreground text-xs">{item.label}</div>
                        <div className="mt-1 text-sm font-medium">{item.value}</div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
