'use client';

import {
  Plus,
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
  Columns,
  FileText,
  MessageSquareQuote,
  Code2,
  Image,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ElementType } from '@/lib/editor/element-defaults';

interface EditorToolbarProps {
  onAddElement: (type: ElementType) => void;
}

const elementGroups = [
  {
    label: 'Typography',
    items: [
      { type: 'heading' as ElementType, label: 'Heading', icon: Type },
      { type: 'paragraph' as ElementType, label: 'Paragraph', icon: AlignLeft },
      { type: 'list' as ElementType, label: 'List', icon: List },
      { type: 'callout' as ElementType, label: 'Callout / Quote', icon: MessageSquareQuote },
      { type: 'codeBlock' as ElementType, label: 'Code Block', icon: Code2 },
    ],
  },
  {
    label: 'Data',
    items: [
      { type: 'table' as ElementType, label: 'Table', icon: Table },
      { type: 'keyValue' as ElementType, label: 'Key-Value', icon: LayoutList },
    ],
  },
  {
    label: 'Charts',
    items: [
      { type: 'barChart' as ElementType, label: 'Bar Chart', icon: BarChart3 },
      { type: 'pieChart' as ElementType, label: 'Pie Chart', icon: PieChart },
      { type: 'lineChart' as ElementType, label: 'Line Chart', icon: TrendingUp },
    ],
  },
  {
    label: 'Media',
    items: [
      { type: 'image' as ElementType, label: 'Image', icon: Image },
    ],
  },
  {
    label: 'Layout',
    items: [
      { type: 'section' as ElementType, label: 'Section', icon: FileText },
      { type: 'columns' as ElementType, label: 'Columns', icon: Columns },
      { type: 'divider' as ElementType, label: 'Divider', icon: Minus },
      { type: 'spacer' as ElementType, label: 'Spacer', icon: MoveVertical },
    ],
  },
];

export function EditorToolbar({ onAddElement }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 size-4" />
            Add Element
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {elementGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {groupIndex > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              <DropdownMenuGroup>
                {group.items.map((item) => (
                  <DropdownMenuItem
                    key={item.type}
                    onClick={() => onAddElement(item.type)}
                  >
                    <item.icon className="mr-2 size-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick add buttons for common elements */}
      <div className="hidden items-center gap-1 md:flex">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('heading')}
          title="Add Heading"
        >
          <Type className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('paragraph')}
          title="Add Paragraph"
        >
          <AlignLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('table')}
          title="Add Table"
        >
          <Table className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('callout')}
          title="Add Callout"
        >
          <MessageSquareQuote className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('codeBlock')}
          title="Add Code Block"
        >
          <Code2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
