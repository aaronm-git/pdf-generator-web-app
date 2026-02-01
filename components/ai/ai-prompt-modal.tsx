'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { usePDFGeneration } from '@/hooks/use-pdf-generation';
import { useEditorStore, useUIStore } from '@/lib/store';
import { useAddDBHistoryEntry } from '@/lib/swr';

const promptSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Please provide more detail about the PDF you want to create'),
});

type PromptFormValues = z.infer<typeof promptSchema>;

interface AIPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const examplePrompts = [
  'Create a quarterly sales report with revenue charts and a summary table',
  'Generate an invoice for consulting services with itemized billing',
  'Design a project proposal with executive summary, timeline, and budget breakdown',
];

export function AIPromptModal({ open, onOpenChange }: AIPromptModalProps) {
  const router = useRouter();
  const { generate, status, error, reset } = usePDFGeneration();

  // Stores
  const entity = useEditorStore((s) => s.entity);
  const createNewEntity = useEditorStore((s) => s.createNewEntity);
  const loadInstructions = useEditorStore((s) => s.loadInstructions);
  const hasUnsavedWork = useEditorStore((s) => s.hasUnsavedWork);
  const showUnsavedChangesModal = useUIStore((s) => s.showUnsavedChangesModal);

  // SWR mutation for history
  const { addEntry: addDBHistoryEntry } = useAddDBHistoryEntry();

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (data: PromptFormValues) => {
    try {
      const instructions = await generate(data.prompt);

      const performLoad = () => {
        // Create a new entity with the generated instructions
        createNewEntity(instructions.metadata.title || 'AI Generated');
        loadInstructions(instructions);

        // Add to DB history
        addDBHistoryEntry({
          type: 'ai-generated',
          prompt: data.prompt,
          instructions,
        });

        // Close modal and navigate to editor
        onOpenChange(false);
        router.push('/editor');

        // Reset form after navigation
        setTimeout(() => {
          form.reset();
          reset();
        }, 200);
      };

      // Check for unsaved changes
      if (entity && hasUnsavedWork()) {
        // Close modal first so the unsaved changes modal can appear
        onOpenChange(false);
        showUnsavedChangesModal(entity.name, performLoad);
      } else {
        performLoad();
      }
    } catch {
      // Error is handled in the hook
    }
  };

  const handleClose = () => {
    if (status !== 'generating') {
      onOpenChange(false);
      // Reset after a delay to allow the dialog to close
      setTimeout(() => {
        form.reset();
        reset();
      }, 200);
    }
  };

  const isLoading = status === 'generating';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Generate PDF with AI
          </DialogTitle>
          <DialogDescription>
            Describe the PDF you want to create. Include details about content,
            layout, charts, tables, and styling.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Create a quarterly sales report with a bar chart showing revenue by region, a table of monthly figures, and an executive summary section..."
                      className="max-h-[400px] min-h-[200px] resize-none overflow-y-auto"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific about the content, data, and visual elements
                    you want. After generation, you can edit the content in the
                    editor before downloading.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Example prompts:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal py-1 text-left text-xs"
                    disabled={isLoading}
                    onClick={() => form.setValue('prompt', example)}
                  >
                    {example.slice(0, 50)}...
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Generate PDF
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
