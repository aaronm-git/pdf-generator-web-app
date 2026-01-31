'use client';

import {
  Type,
  AlignLeft,
  List,
  Table,
  BarChart3,
  PieChart,
  TrendingUp,
  LayoutList,
  Minus,
  MoveVertical,
  FileText,
  Image,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Quote,
  MessageSquareQuote,
  Code2,
  Columns,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getElementLabel, getElementSummary, type ElementWithId } from '@/lib/editor/element-defaults';
import type { PDFElement } from '@/types/pdf';

interface ElementCardProps {
  element: ElementWithId;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const elementIcons: Record<PDFElement['type'], React.ComponentType<{ className?: string }>> = {
  heading: Type,
  paragraph: AlignLeft,
  list: List,
  caption: Quote,
  callout: MessageSquareQuote,
  codeBlock: Code2,
  section: FileText,
  columns: Columns,
  spacer: MoveVertical,
  divider: Minus,
  pageBreak: FileText,
  table: Table,
  keyValue: LayoutList,
  barChart: BarChart3,
  pieChart: PieChart,
  lineChart: TrendingUp,
  image: Image,
};

export function ElementCard({
  element,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: ElementCardProps) {
  const Icon = elementIcons[element.type] || FileText;
  const label = getElementLabel(element.type);
  const summary = getElementSummary(element);

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50',
        isSelected && 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
      )}
      onClick={onSelect}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="truncate text-xs text-muted-foreground">{summary}</div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={isFirst}
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={isLast}
        >
          <ChevronDown className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
