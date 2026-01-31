'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AIPromptModal } from '@/components/ai/ai-prompt-modal';

export function TopNavbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">PDF Generator</h1>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
            size="sm"
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">Generate with AI</span>
            <span className="sm:hidden">AI</span>
          </Button>
        </div>
      </header>

      <AIPromptModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
