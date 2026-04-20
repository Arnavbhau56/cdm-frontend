// PDF parser utility: extracts text from a PDF file client-side using pdfjs-dist,
// then maps content to call note sections by matching known heading aliases.

import { CALL_NOTE_SECTIONS } from './call-note-sections';

export async function extractTextFromPdf(file: File): Promise<string> {
  console.log('[PDF] starting extraction, file:', file.name, 'size:', file.size);
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
  console.log('[PDF] workerSrc:', pdfjsLib.GlobalWorkerOptions.workerSrc);

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  console.log('[PDF] pages:', pdf.numPages);
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[]).map(item => item.str).join(' ');
    console.log(`[PDF] page ${i} text (first 200):`, pageText.slice(0, 200));
    fullText += pageText + '\n';
  }
  console.log('[PDF] total text length:', fullText.length);
  return fullText;
}

export function parseSectionsFromText(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  console.log('[PARSE] input length:', text.length);
  console.log('[PARSE] first 500:', text.slice(0, 500));

  const patterns: { pattern: RegExp; key: string }[] = [];
  for (const section of CALL_NOTE_SECTIONS) {
    for (const alias of section.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match heading with optional "Call Notes " prefix and optional leading number.
      // After the alias, consume any trailing " / word" or " & word" separators
      // so that "Solution / Product" doesn't leave "/ Product" as content start.
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
      console.log('[PARSE] matched key:', h.key, 'index:', match.index, 'match:', JSON.stringify(match[0]));
      found.push({ index: match.index, key: h.key, matchLen: match[0].length });
    }
  }

  console.log('[PARSE] sections found:', found.length, found.map(f => f.key));
  found.sort((a, b) => a.index - b.index);

  for (let i = 0; i < found.length; i++) {
    const start = found[i].index + found[i].matchLen;
    const end = i + 1 < found.length ? found[i + 1].index : text.length;
    const content = text.slice(start, end).trim();
    console.log('[PARSE] section', found[i].key, 'content length:', content.length, 'preview:', content.slice(0, 100));
    if (content) result[found[i].key] = content;
  }

  return result;
}
