import { Fragment } from 'react';

/** Renders **bold** and *italic* spans within a line of text. */
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={`${keyPrefix}-${i}`}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
  });
}

/**
 * Renders the markdown-as-storage-format used by Content Management fields
 * (overview, challenges, ourApproach, coverage, localProof). Supports the subset produced
 * by the admin editor: ## / ### headings, "- " bullet lists, paragraphs, **bold**, *italic*.
 */
export function Markdown({ content }: { content: string }) {
  const blocks = content.split('\n\n').filter((block) => block.trim().length > 0);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith('### ')) {
          return <h3 key={i}>{renderInline(block.slice(4), `h3-${i}`)}</h3>;
        }
        if (block.startsWith('## ')) {
          return <h2 key={i}>{renderInline(block.slice(3), `h2-${i}`)}</h2>;
        }
        if (block.startsWith('- ')) {
          return (
            <ul key={i}>
              {block.split('\n').map((li, j) => (
                <li key={j}>{renderInline(li.replace(/^- /, ''), `li-${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(block, `p-${i}`)}</p>;
      })}
    </>
  );
}
