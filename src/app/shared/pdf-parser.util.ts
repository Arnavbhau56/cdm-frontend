// PDF parser utility: extracts text from a PDF file client-side using pdfjs-dist,
// then maps content to call note sections by matching known heading aliases.

import { CALL_NOTE_SECTIONS } from './call-note-sections';

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Use unpkg CDN so the worker is always served with the correct JS MIME type,
  // regardless of how the hosting platform (Vercel, etc.) handles static assets.
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += (content.items as any[]).map(item => item.str).join(' ') + '\n';
  }
  return fullText;
}

export function parseSectionsFromText(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  const patterns: { pattern: RegExp; key: string }[] = [];
  for (const section of CALL_NOTE_SECTIONS) {
    for (const alias of section.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      patterns.push({
        pattern: new RegExp(
          '(?:^|[\\n\\s])(?:call\\s+notes\\s+)?(?:\\d+\\.\\s*)?' +
          escaped +
          '(?:\\s*[/&%]\\s*\\w+)*(?=[\\s\\n]|$)',
          'i'
        ),
        key: section.key,
      });
    }
  }

  const found: { index: number; key: string; matchLen: number }[] = [];
  for (const h of patterns) {
    const match = h.pattern.exec(text);
    if (match && !found.find(f => f.key === h.key)) {
      found.push({ index: match.index, key: h.key, matchLen: match[0].length });
    }
  }

  found.sort((a, b) => a.index - b.index);

  for (let i = 0; i < found.length; i++) {
    const start = found[i].index + found[i].matchLen;
    const end = i + 1 < found.length ? found[i + 1].index : text.length;
    const content = text.slice(start, end).trim();
    if (content) result[found[i].key] = content;
  }

  return result;
}
