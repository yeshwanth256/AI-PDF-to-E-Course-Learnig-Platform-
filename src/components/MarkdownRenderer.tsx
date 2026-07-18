import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Simple and highly effective regex markdown block parser
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 mb-6 space-y-2 text-gray-300">
          {listItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }} />
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushCodeBlock = (key: string) => {
    if (codeLines.length > 0) {
      elements.push(
        <div key={`code-${key}`} className="relative bg-[#0d1117] rounded-xl border border-gray-800 p-4 mb-6 font-mono text-xs text-gray-200 overflow-x-auto leading-relaxed shadow-lg">
          {codeLang && (
            <div className="absolute top-2 right-3 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              {codeLang}
            </div>
          )}
          <pre className="pt-2"><code>{codeLines.join('\n')}</code></pre>
        </div>
      );
      codeLines = [];
      inCodeBlock = false;
    }
  };

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const dataRows = tableRows.slice(2); // Skip separator row (idx 1)

      elements.push(
        <div key={`table-${key}`} className="overflow-x-auto mb-6 rounded-xl border border-gray-800 shadow-md">
          <table className="min-w-full divide-y divide-gray-800 text-sm">
            <thead className="bg-gray-900/50">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="px-4 py-3 text-left font-medium text-gray-300 tracking-wider">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-[#0c101b]">
              {dataRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-900/30 transition-colors">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3 text-gray-300 whitespace-nowrap" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cell.trim()) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const parseInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-300 border border-gray-700">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block start/end
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(`${i}`);
      } else {
        // Flush any list before starting code
        flushList(`${i}`);
        flushTable(`${i}`);
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // 2. Callout / Alert Notes (GFM)
    if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!IMPORTANT]')) {
      flushList(`${i}`);
      flushTable(`${i}`);
      const type = trimmed.includes('NOTE') ? 'note' : trimmed.includes('TIP') ? 'tip' : 'important';
      const heading = type === 'note' ? 'Note' : type === 'tip' ? 'Tip' : 'Important';
      const borderClass = type === 'note' ? 'border-sky-500/50 bg-sky-950/20' : type === 'tip' ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-amber-500/50 bg-amber-950/20';
      const textClass = type === 'note' ? 'text-sky-300' : type === 'tip' ? 'text-emerald-300' : 'text-amber-300';
      
      // Grab following blockquotes
      const calloutLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith('>')) {
        calloutLines.push(lines[j].trim().replace(/^>\s?/, ''));
        j++;
      }
      i = j - 1;

      elements.push(
        <div key={`callout-${i}`} className={`p-4 rounded-xl border-l-4 ${borderClass} mb-6 shadow-md transition-all duration-300 hover:translate-x-0.5`}>
          <div className={`font-display font-semibold text-xs uppercase tracking-wider mb-1.5 ${textClass}`}>
            {heading}
          </div>
          <p className="text-sm text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(calloutLines.join(' ')) }} />
        </div>
      );
      continue;
    }

    // Standard Blockquotes
    if (trimmed.startsWith('>') && !trimmed.includes('[!')) {
      flushList(`${i}`);
      flushTable(`${i}`);
      const quoteText = trimmed.replace(/^>\s?/, '');
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-gray-700 pl-4 py-1 italic text-gray-400 mb-6" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(quoteText) }} />
      );
      continue;
    }

    // 3. Tables
    if (trimmed.startsWith('|')) {
      flushList(`${i}`);
      inTable = true;
      const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(`${i}`);
    }

    // 4. Headers
    if (trimmed.startsWith('#')) {
      flushList(`${i}`);
      flushTable(`${i}`);
      const hLevel = line.match(/^#+/)?.[0].length || 1;
      const titleText = trimmed.replace(/^#+\s?/, '');
      const parsedText = parseInlineMarkdown(titleText);

      if (hLevel === 1) {
        elements.push(
          <h1 key={`h1-${i}`} className="font-display font-bold text-2xl text-white mb-6 border-b border-gray-800 pb-2 mt-8 tracking-tight" dangerouslySetInnerHTML={{ __html: parsedText }} />
        );
      } else if (hLevel === 2) {
        elements.push(
          <h2 key={`h2-${i}`} className="font-display font-semibold text-xl text-gray-100 mb-4 mt-6 tracking-tight" dangerouslySetInnerHTML={{ __html: parsedText }} />
        );
      } else {
        elements.push(
          <h3 key={`h3-${i}`} className="font-display font-medium text-lg text-gray-200 mb-3 mt-4 tracking-tight" dangerouslySetInnerHTML={{ __html: parsedText }} />
        );
      }
      continue;
    }

    // 5. Unordered list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      continue;
    } else if (inList && trimmed === '') {
      // blank line ends a list
      flushList(`${i}`);
    }

    // 6. Horizontal Rules
    if (trimmed === '---') {
      flushList(`${i}`);
      flushTable(`${i}`);
      elements.push(
        <hr key={`hr-${i}`} className="my-8 border-gray-800/80" />
      );
      continue;
    }

    // 7. Regular paragraph
    if (trimmed !== '') {
      if (inList) {
        // Appending to list item if indented, else flush
        if (line.startsWith('  ') || line.startsWith('\t')) {
          listItems[listItems.length - 1] += ' ' + trimmed;
          continue;
        } else {
          flushList(`${i}`);
        }
      }
      flushTable(`${i}`);

      elements.push(
        <p key={`p-${i}`} className="text-gray-300 leading-relaxed mb-5 text-sm" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(trimmed) }} />
      );
    }
  }

  // End of file flushes
  flushList('end');
  flushCodeBlock('end');
  flushTable('end');

  return <div className="space-y-1">{elements}</div>;
}
