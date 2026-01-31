import React from 'react';

export interface RichTextNode {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link' | 'strikethrough';
  content: string;
  href?: string;
  children?: RichTextNode[];
}

/**
 * Parse inline markdown to structured nodes
 * Supports: **bold**, *italic*, `code`, [link](url), ~~strikethrough~~
 */
export function parseInlineMarkdown(text: string): RichTextNode[] {
  const nodes: RichTextNode[] = [];
  let remaining = text;

  // Patterns in order of precedence
  const patterns = [
    // Bold: **text** or __text__
    { regex: /\*\*(.+?)\*\*|__(.+?)__/, type: 'bold' as const },
    // Strikethrough: ~~text~~
    { regex: /~~(.+?)~~/, type: 'strikethrough' as const },
    // Italic: *text* or _text_ (but not inside words for _)
    { regex: /\*([^*]+)\*|(?<![a-zA-Z])_([^_]+)_(?![a-zA-Z])/, type: 'italic' as const },
    // Code: `code`
    { regex: /`([^`]+)`/, type: 'code' as const },
    // Link: [text](url)
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, type: 'link' as const },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; node: RichTextNode } | null = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined) {
        const matchIndex = match.index;
        if (!earliestMatch || matchIndex < earliestMatch.index) {
          const content = match[1] || match[2] || '';
          const node: RichTextNode = {
            type: pattern.type,
            content,
          };

          if (pattern.type === 'link' && match[2]) {
            node.content = match[1];
            node.href = match[2];
          }

          earliestMatch = {
            index: matchIndex,
            length: match[0].length,
            node,
          };
        }
      }
    }

    if (earliestMatch) {
      // Add plain text before the match
      if (earliestMatch.index > 0) {
        nodes.push({
          type: 'text',
          content: remaining.slice(0, earliestMatch.index),
        });
      }

      // Add the matched node
      nodes.push(earliestMatch.node);

      // Continue with remaining text
      remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
    } else {
      // No more matches, add remaining as plain text
      nodes.push({
        type: 'text',
        content: remaining,
      });
      break;
    }
  }

  return nodes;
}

/**
 * Check if text contains any markdown formatting
 */
export function hasMarkdown(text: string): boolean {
  const patterns = [
    /\*\*(.+?)\*\*/,
    /__(.+?)__/,
    /\*([^*]+)\*/,
    /(?<![a-zA-Z])_([^_]+)_(?![a-zA-Z])/,
    /`([^`]+)`/,
    /\[([^\]]+)\]\(([^)]+)\)/,
    /~~(.+?)~~/,
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Render rich text nodes to React elements (for preview)
 */
export function renderRichTextToReact(
  nodes: RichTextNode[],
  baseStyle?: React.CSSProperties
): React.ReactNode[] {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'bold':
        return React.createElement('strong', { key: index }, node.content);

      case 'italic':
        return React.createElement('em', { key: index }, node.content);

      case 'code':
        return React.createElement('code', {
          key: index,
          style: {
            backgroundColor: '#f1f5f9',
            padding: '0.125rem 0.375rem',
            borderRadius: '0.25rem',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.875em',
          },
        }, node.content);

      case 'link':
        return React.createElement('a', {
          key: index,
          href: node.href,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: {
            color: '#3182ce',
            textDecoration: 'underline',
          },
        }, node.content);

      case 'strikethrough':
        return React.createElement('del', { key: index }, node.content);

      case 'text':
      default:
        return React.createElement(React.Fragment, { key: index }, node.content);
    }
  });
}

/**
 * Parse and render markdown text to React (convenience function)
 */
export function parseAndRenderMarkdown(
  text: string,
  baseStyle?: React.CSSProperties
): React.ReactNode {
  const nodes = parseInlineMarkdown(text);
  const elements = renderRichTextToReact(nodes, baseStyle);
  return React.createElement(React.Fragment, null, ...elements);
}
