import { Card, CardContent } from "@workspace/ui/components/card";

export default function Loading() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="bg-muted h-8 w-1/3 rounded" />
            </CardContent>
        </Card>
    );
}
