import React from 'react';
import { Text, Link } from '@react-pdf/renderer';
import { parseInlineMarkdown, type RichTextNode } from './parser';

// Use inline styles to avoid module-level StyleSheet.create timing issues
const inlineStyles = {
  bold: {
    fontWeight: 'bold' as const,
  },
  italic: {
    fontStyle: 'italic' as const,
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f1f5f9',
    fontSize: 10,
  },
  strikethrough: {
    textDecoration: 'line-through' as const,
  },
  link: {
    color: '#3182ce',
    textDecoration: 'underline' as const,
  },
};

/**
 * Render a single rich text node to PDF elements
 */
function renderNode(node: RichTextNode, key: number): React.ReactNode {
  switch (node.type) {
    case 'bold':
      return (
        <Text key={key} style={inlineStyles.bold}>
          {node.content}
        </Text>
      );

    case 'italic':
      return (
        <Text key={key} style={inlineStyles.italic}>
          {node.content}
        </Text>
      );

    case 'code':
      return (
        <Text key={key} style={inlineStyles.code}>
          {node.content}
        </Text>
      );

    case 'strikethrough':
      return (
        <Text key={key} style={inlineStyles.strikethrough}>
          {node.content}
        </Text>
      );

    case 'link':
      return (
        <Link key={key} src={node.href || ''} style={inlineStyles.link}>
          {node.content}
        </Link>
      );

    case 'text':
    default:
      return node.content;
  }
}

/**
 * Render rich text nodes to PDF Text children
 */
export function renderRichTextToPDF(nodes: RichTextNode[]): React.ReactNode[] {
  return nodes.map((node, index) => renderNode(node, index));
}

/**
 * Parse markdown and render to PDF elements
 */
export function parseAndRenderMarkdownToPDF(text: string): React.ReactNode[] {
  const nodes = parseInlineMarkdown(text);
  return renderRichTextToPDF(nodes);
}
