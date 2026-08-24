import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";

export default function Loading() {
    return (
        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <div className="bg-muted h-5 w-1/4 rounded" />
                    <div className="bg-muted h-4 w-1/2 rounded" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="bg-muted h-12 w-full rounded" />
                    <div className="bg-muted h-12 w-full rounded" />
                    <div className="bg-muted h-12 w-full rounded" />
                </CardContent>
            </Card>
        </div>
    );
}
