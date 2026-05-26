// Minimal inline-markdown → React-safe segments. Supports **bold**
// only (the rest is plain text). Returns an array of { text, bold }
// segments the renderer can map over. Use for the marketing-grade
// theme bullets which sometimes include **emphasised** spans.

export interface InlineSegment {
  text: string;
  bold: boolean;
}

export function renderInlineMarkdown(input: string | null | undefined): InlineSegment[] {
  if (!input) return [];
  const result: InlineSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    if (match.index > lastIndex) {
      result.push({ text: input.slice(lastIndex, match.index), bold: false });
    }
    result.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < input.length) {
    result.push({ text: input.slice(lastIndex), bold: false });
  }
  return result;
}
