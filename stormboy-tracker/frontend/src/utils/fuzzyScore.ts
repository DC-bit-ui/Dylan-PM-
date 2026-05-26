// Lightweight fuzzy match: case-insensitive token contains. Returns
// score (higher = better) or 0 for no match. Used by the ASK
// autocomplete to rank curated questions against the user's query.

export interface FuzzyTarget {
  label?: string;
  hint?: string;
  body?: string;
}

export function fuzzyScore(query: string, target: FuzzyTarget): number {
  const q = (query || '').toLowerCase().trim();
  if (!q) return 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  const haystacks: Array<{ text: string; weight: number }> = [
    { text: (target.label || '').toLowerCase(), weight: 3 },
    { text: (target.hint || '').toLowerCase(), weight: 2 },
    { text: (target.body || '').toLowerCase(), weight: 1 },
  ];
  let score = 0;
  for (const tok of tokens) {
    let bestForToken = 0;
    for (const h of haystacks) {
      if (h.text.includes(tok)) {
        // Bonus if the token starts at a word boundary
        const idx = h.text.indexOf(tok);
        const boundary = idx === 0 || /\s/.test(h.text.charAt(idx - 1));
        bestForToken = Math.max(bestForToken, h.weight + (boundary ? 1 : 0));
      }
    }
    if (bestForToken === 0) return 0; // every token must appear somewhere
    score += bestForToken;
  }
  return score;
}
