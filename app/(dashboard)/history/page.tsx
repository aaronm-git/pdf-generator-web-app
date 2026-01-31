import { History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">History</h2>
        <p className="text-muted-foreground">
          View your PDF generation history
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <History className="size-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            No history yet
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your generation history will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
