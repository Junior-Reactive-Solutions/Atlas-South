import { Fragment } from 'react';
import { Link } from 'react-router-dom';

/**
 * `[label](target)` link support, added 2026-09-03 for the Insights articles.
 *
 * Internal links are among the highest-value on-page SEO signals an article can carry —
 * they pass topical relevance to the service pages the article is meant to feed, and keep
 * a reader who arrived from search moving through the site instead of bouncing. Without
 * this, an article could only ever be a dead end.
 *
 * Only two shapes are accepted, and anything else renders as plain text rather than
 * becoming a link:
 *   - an in-site path beginning with "/", routed through React Router so it doesn't
 *     trigger a full page reload
 *   - an absolute http(s) URL, opened in a new tab with rel="noopener noreferrer"
 *
 * The allow-list is the point. This content is admin-authored, but "trusted author" is not
 * a safe assumption to build on: a `javascript:` or `data:` href pasted into the editor —
 * by mistake, or by someone who got into the panel — would otherwise become a live XSS
 * vector on a public page. Refusing to link is a visible, harmless failure; the alternative
 * is not.
 */
// Two regexes, deliberately. The split pattern needs the /g flag; the test pattern must
// NOT have it — a global regex keeps `lastIndex` between calls, so `.test()` on one
// alternates true/false across identical inputs and would drop every other link.
const LINK_SPLIT = /(\[[^\]]+\]\([^)\s]+\))/g;
const LINK_EXACT = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

function renderLink(markup: string, key: string) {
  const match = LINK_EXACT.exec(markup);
  if (!match) return <Fragment key={key}>{markup}</Fragment>;
  const [, label, href] = match;

  if (href.startsWith('/')) {
    return (
      <Link key={key} to={href}>
        {label}
      </Link>
    );
  }

  if (href.startsWith('https://') || href.startsWith('http://')) {
    return (
      <a key={key} href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  // Not a shape we allow — show the author their markup rendered literally, so the problem
  // is obvious on the page rather than silently swallowed.
  return <Fragment key={key}>{markup}</Fragment>;
}

/** Renders **bold**, *italic* and [links](/path) within a line of text. */
function renderInline(text: string, keyPrefix: string) {
  // Links are split out first: their label can contain the * characters the emphasis
  // pattern looks for, so running emphasis first would tear a link's markup in half.
  return text
    .split(LINK_SPLIT)
    .filter(Boolean)
    .flatMap((segment, segIndex) => {
      if (LINK_EXACT.test(segment)) {
        return [renderLink(segment, `${keyPrefix}-link-${segIndex}`)];
      }
      return segment
        .split(/(\*\*.+?\*\*|\*.+?\*)/g)
        .filter(Boolean)
        .map((part, i) => {
          const key = `${keyPrefix}-${segIndex}-${i}`;
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={key}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={key}>{part.slice(1, -1)}</em>;
          }
          return <Fragment key={key}>{part}</Fragment>;
        });
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
