'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Braces, Copy, Check, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { pdfInstructionsSchema } from '@/lib/pdf/schema';
import {
  validateJsonString,
  safeStringify,
  type JsonValidationResult,
} from '@/lib/validation/json-validator';
import type { PDFInstructions } from '@/lib/pdf/schema';

interface JsonEditorDialogProps {
  instructions: PDFInstructions;
  onApply: (instructions: PDFInstructions) => void;
  disabled?: boolean;
}

export function JsonEditorDialog({
  instructions,
  onApply,
  disabled,
}: JsonEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonValue, setJsonValue] = useState('');
  const [validation, setValidation] = useState<JsonValidationResult<PDFInstructions>>({
    isValid: true,
  });
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const initialJsonRef = useRef('');

  // Initialize JSON when dialog opens
  useEffect(() => {
    if (open) {
      const json = safeStringify(instructions);
      setJsonValue(json);
      initialJsonRef.current = json;
      setValidation({ isValid: true, data: instructions });
      setHasChanges(false);
      setCopied(false);
    }
  }, [open, instructions]);

  // Validate on every change
  const handleJsonChange = useCallback((value: string) => {
    setJsonValue(value);
    setHasChanges(value !== initialJsonRef.current);
    
    // Validate immediately on change
    const result = validateJsonString(value, pdfInstructionsSchema);
    setValidation(result);
  }, []);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = jsonValue;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [jsonValue]);

  // Apply changes
  const handleApply = useCallback(() => {
    if (validation.isValid && validation.data) {
      onApply(validation.data);
      setOpen(false);
    }
  }, [validation, onApply]);

  // Format/prettify JSON
  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonValue);
      const formatted = safeStringify(parsed);
      setJsonValue(formatted);
      setHasChanges(formatted !== initialJsonRef.current);
    } catch {
      // If JSON is invalid, don't format
    }
  }, [jsonValue]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Braces className="mr-2 size-4" />
          JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit PDF JSON</DialogTitle>
          <DialogDescription>
            View and edit the raw JSON structure of your PDF document. Changes are
            validated in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-2">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 size-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 size-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleFormat}>
                Format
              </Button>
            </div>
            
            {/* Validation status */}
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="size-4" />
                  Valid JSON
                </span>
              ) : (
                <span className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="size-4" />
                  Invalid
                </span>
              )}
            </div>
          </div>

          {/* JSON Editor */}
          <div className="flex-1 min-h-0 relative border rounded-md overflow-hidden">
            <Editor
              height="400px"
              defaultLanguage="json"
              language="json"
              value={jsonValue}
              onChange={(value) => handleJsonChange(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                formatOnPaste: true,
                formatOnType: false,
                wordWrap: 'off',
                scrollbar: {
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                },
              }}
              loading={
                <div className="flex items-center justify-center h-[400px] bg-[#1e1e1e] text-gray-400">
                  Loading editor...
                </div>
              }
            />
          </div>

          {/* Error message */}
          {!validation.isValid && validation.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <span className="font-medium">Error:</span> {validation.error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!validation.isValid || !hasChanges}
          >
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
