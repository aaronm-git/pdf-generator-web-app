import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">
          View and manage your generated PDFs
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <FileText className="size-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            No documents yet
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Documents you generate will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
