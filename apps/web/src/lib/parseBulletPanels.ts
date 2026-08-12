import type { BenefitPanel } from '../components/sections';

export interface ParsedBullets {
  /** Any prose that appears before the first bullet, e.g. a lead-in sentence. */
  lead: string;
  panels: BenefitPanel[];
}

/**
 * Turns a markdown bullet list of the form
 *
 *   Some lead-in sentence:
 *   - **Zero-downtime mandate:** Unlike a typical office, you cannot simply...
 *   - **Sterility and infection control:** Service engineers must understand...
 *
 * into lead text plus title/description pairs suitable for <BenefitPanels>.
 *
 * Why this exists: the industry and area copy already written for this site is genuinely
 * good and sector-specific — it was only ever *presented* badly, as a wall of prose in a
 * narrow column. Parsing the existing structure lets the new panel layout reuse that copy
 * verbatim, so the redesign needs no content migration and no rewriting by the client.
 *
 * Returns `null` when the markdown does not fit the pattern (no bolded bullet leads), so
 * callers can fall back to rendering it as ordinary prose rather than showing panels with
 * empty headings.
 */
export function parseBulletPanels(markdown: string | undefined): ParsedBullets | null {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  const leadLines: string[] = [];
  const panels: BenefitPanel[] = [];
  let seenBullet = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (!bullet) {
      // Prose after the bullets have started isn't something this layout can place —
      // bail out and let the caller render the whole block as prose instead.
      if (seenBullet) return null;
      leadLines.push(line);
      continue;
    }

    seenBullet = true;

    // Accept both "**Title:** body" and "**Title** — body".
    const withTitle = bullet[1].match(/^\*\*(.+?)\*\*\s*[:—–-]?\s*(.*)$/);
    if (!withTitle || !withTitle[2].trim()) return null;

    panels.push({
      title: withTitle[1].replace(/:$/, '').trim(),
      description: withTitle[2].trim(),
    });
  }

  if (panels.length === 0) return null;

  return { lead: leadLines.join(' '), panels };
}
