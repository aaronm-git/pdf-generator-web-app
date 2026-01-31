'use client';

import { useState } from 'react';
import type { CodeBlockElement } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CodeBlockEditorProps {
  element: CodeBlockElement;
  onSave: (element: CodeBlockElement) => void;
  onCancel: () => void;
}

const languages = [
  { value: '', label: 'None' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
];

export function CodeBlockEditor({ element, onSave, onCancel }: CodeBlockEditorProps) {
  const [code, setCode] = useState(element.code);
  const [language, setLanguage] = useState(element.language || '');
  const [showLineNumbers, setShowLineNumbers] = useState(element.showLineNumbers ?? true);
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'codeBlock',
      code,
      language: language || undefined,
      showLineNumbers,
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Textarea
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code here..."
          rows={10}
          className="font-mono text-sm"
          style={{ tabSize: 2 }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="showLineNumbers"
          checked={showLineNumbers}
          onCheckedChange={setShowLineNumbers}
        />
        <Label htmlFor="showLineNumbers">Show Line Numbers</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="marginBottom">Margin Bottom (px)</Label>
        <Input
          id="marginBottom"
          type="number"
          value={marginBottom}
          onChange={(e) => setMarginBottom(e.target.value)}
          placeholder="Auto"
          min={0}
          className="w-32"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}
