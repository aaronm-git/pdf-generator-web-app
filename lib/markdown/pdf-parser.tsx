import React from 'react';
import { Text, Link, StyleSheet } from '@react-pdf/renderer';
import { parseInlineMarkdown, type RichTextNode } from './parser';

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f1f5f9',
    fontSize: 10,
  },
  strikethrough: {
    textDecoration: 'line-through',
  },
  link: {
    color: '#3182ce',
    textDecoration: 'underline',
  },
});

/**
 * Render a single rich text node to PDF elements
 */
function renderNode(node: RichTextNode, key: number): React.ReactNode {
  switch (node.type) {
    case 'bold':
      return (
        <Text key={key} style={styles.bold}>
          {node.content}
        </Text>
      );

    case 'italic':
      return (
        <Text key={key} style={styles.italic}>
          {node.content}
        </Text>
      );

    case 'code':
      return (
        <Text key={key} style={styles.code}>
          {node.content}
        </Text>
      );

    case 'strikethrough':
      return (
        <Text key={key} style={styles.strikethrough}>
          {node.content}
        </Text>
      );

    case 'link':
      return (
        <Link key={key} src={node.href || ''} style={styles.link}>
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
