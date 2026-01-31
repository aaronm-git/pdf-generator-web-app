'use client';

import { FileText, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AIPromptModal } from '@/components/ai/ai-prompt-modal';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Create beautiful PDFs with the power of AI
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => setIsModalOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Generate with AI
            </CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Describe your PDF and let AI create it for you
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">From Template</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start from a pre-built template
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blank Document</CardTitle>
            <Plus className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start from scratch with a blank canvas
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Recent Documents</h3>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="size-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No documents yet
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              <Sparkles className="mr-2 size-4" />
              Create your first PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      <AIPromptModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
