import { FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
        <p className="text-muted-foreground">
          Pre-built templates to get you started quickly
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <FolderOpen className="size-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            Templates coming soon
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pre-built PDF templates will be available here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
