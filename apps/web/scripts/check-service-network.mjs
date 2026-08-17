/**
 * Geometry checks for the ServiceNetwork panel's tracks.
 *
 * These rules are easy to break by nudging a single coordinate, and the failures are
 * subtle in a way a screenshot won't catch — a node that goes un-hoverable halfway along
 * its path, or two nodes parking on top of each other. Run it after editing TRACKS:
 *
 *   node apps/web/scripts/check-service-network.mjs
 *
 * What it asserts, and why each one exists:
 *  1. Every track starts off the left edge, so nodes enter from off-screen.
 *  2. `endX`/`endY` match the path's real final point — they double as the node's CSS
 *     resting position, so a mismatch makes the node jump on first paint.
 *  3. No track overshoots its resting x, so nothing sails off the right edge.
 *  4. Every track stays inside the panel vertically.
 *  5. Every track has two real corners and enough vertical travel to read as a turn —
 *     this caught a degenerate corner whose control point equalled its endpoint.
 *  6. No node ever overlaps the copy block. The node layer sits ABOVE the copy so it stays
 *     hoverable throughout; that is only acceptable while the icons never cover the
 *     headline or the CTA. This is the rule most likely to be broken by a "small" tweak.
 *  7. Resting positions don't collide, and the rightmost node stays inside the panel.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  resolve(here, '../src/components/sections/ServiceNetwork.tsx'),
  'utf8',
);

const VB_W = 1200;
const VB_H = 820;
/** Nodes actually rendered today (one per currently-visible service). */
const VISIBLE = 6;
const RADIUS = { sm: 32, md: 40, lg: 48 };

/**
 * The copy block in viewBox units. Measured in-browser at a 1280 viewport rather than
 * derived on paper — the first version of this constant was wrong by 40px because it was
 * reasoned from the CTA's position instead of the column's own bounding box.
 */
const COPY = { right: 562, top: 128, bottom: 532 };
/** Measured section width at a 1280 viewport (1280 minus scrollbar). */
const PANEL_W = 1265;

const block = src.split('const TRACKS = [')[1].split('] as const;')[0];
const tracks = [
  ...block.matchAll(/d:\s*'([^']+)'[\s\S]*?endX:\s*(-?\d+)[\s\S]*?endY:\s*(-?\d+)[\s\S]*?size:\s*'(sm|md|lg)'/g),
].map((m) => ({ d: m[1], endX: +m[2], endY: +m[3], size: m[4] }));

/** Samples a path built from M / L / Q commands, returning points and corner controls. */
function sample(d) {
  const tokens = d.match(/[MLQ][^MLQ]*/g);
  let cur = null;
  const pts = [];
  const corners = [];
  for (const tk of tokens) {
    const cmd = tk[0];
    const n = tk.slice(1).match(/-?[\d.]+/g).map(Number);
    if (cmd === 'M') {
      cur = { x: n[0], y: n[1] };
      pts.push(cur);
    } else if (cmd === 'L') {
      const p = { x: n[0], y: n[1] };
      for (let t = 0; t <= 1; t += 0.01)
        pts.push({ x: cur.x + (p.x - cur.x) * t, y: cur.y + (p.y - cur.y) * t });
      cur = p;
    } else {
      const c = { x: n[0], y: n[1] };
      const p = { x: n[2], y: n[3] };
      // A control point equal to either endpoint is not a bend.
      const degenerate =
        (c.x === cur.x && c.y === cur.y) || (c.x === p.x && c.y === p.y);
      if (!degenerate) corners.push(c);
      for (let t = 0; t <= 1; t += 0.01) {
        const u = 1 - t;
        pts.push({
          x: u * u * cur.x + 2 * u * t * c.x + t * t * p.x,
          y: u * u * cur.y + 2 * u * t * c.y + t * t * p.y,
        });
      }
      cur = p;
    }
  }
  return { pts, end: cur, corners };
}

let failures = 0;
const rested = [];

tracks.forEach((tr, i) => {
  const { pts, end, corners } = sample(tr.d);
  const r = RADIUS[tr.size];
  const problems = [];

  if (pts[0].x > -60) problems.push(`starts at x=${pts[0].x}, not off-left`);
  if (end.x !== tr.endX || end.y !== tr.endY)
    problems.push(`path ends ${end.x},${end.y} but declares ${tr.endX},${tr.endY}`);
  const maxX = Math.max(...pts.map((p) => p.x));
  if (maxX > tr.endX + 0.5) problems.push(`overshoots right to x=${maxX.toFixed(0)}`);
  const outside = pts.filter((p) => p.y - r < -r || p.y + r > VB_H + r);
  if (outside.length) problems.push(`${outside.length} samples outside the panel`);
  if (corners.length < 2) problems.push(`${corners.length} real corner(s), needs 2`);
  const yRange = Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y));
  if (yRange < 80) problems.push(`only ${yRange.toFixed(0)}px vertical travel`);

  // Rule 6 — the one that keeps the nodes hoverable without covering the copy.
  if (i < VISIBLE) {
    const hits = pts.filter(
      (p) =>
        p.x - r < COPY.right && p.y + r > COPY.top && p.y - r < COPY.bottom,
    );
    if (hits.length) {
      const ys = hits.map((h) => Math.round(h.y));
      problems.push(
        `overlaps the copy block at ${hits.length} samples (y ${Math.min(...ys)}–${Math.max(...ys)})`,
      );
    }
  }

  if (problems.length) {
    failures++;
    console.log(`track ${i}  FAIL  ${problems.join('; ')}`);
  } else {
    console.log(
      `track ${i}  ok    corners=${corners.length} yTravel=${yRange.toFixed(0)} rest=${tr.endX},${tr.endY}`,
    );
  }
  if (i < VISIBLE) rested.push({ i, x: tr.endX, y: tr.endY, r });
});

const sx = PANEL_W / VB_W;
let tight = 0;
for (let a = 0; a < rested.length; a++) {
  for (let b = a + 1; b < rested.length; b++) {
    const A = rested[a];
    const B = rested[b];
    const dist = Math.hypot(A.x * sx - B.x * sx, A.y - B.y);
    const need = A.r + B.r;
    if (dist < need + 10) {
      tight++;
      console.log(
        `rest  FAIL  nodes ${A.i} & ${B.i} are ${dist.toFixed(0)}px apart, need ${need}+10`,
      );
    }
  }
}
if (!tight) console.log('rest  ok    all resting pairs clear by >10px');

/**
 * Transit collisions.
 *
 * The bands above and below the copy are narrow — together they can't hold six 80px nodes
 * side by side — so nodes are kept apart by *time*, via their per-track delay, not by
 * vertical spacing alone. That can't be checked by eye or by reasoning about the bands, so
 * this replays the component's own stagger and easing across the whole journey and measures
 * every pair at every step.
 */
const delays = [...block.matchAll(/delay:\s*([\d.]+)/g)].map((m) => +m[1]).slice(0, VISIBLE);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (n) => Math.min(1, Math.max(0, n));
const sampled = tracks.slice(0, VISIBLE).map((tr) => sample(tr.d));

const posAt = (idx, travel) => {
  const staggered = clamp01((travel - delays[idx]) / (1 - delays[idx]));
  const t = easeOutCubic(staggered);
  const pts = sampled[idx].pts;
  return pts[Math.min(pts.length - 1, Math.round(t * (pts.length - 1)))];
};

let transitClashes = 0;
let worst = { gap: Infinity };
for (let step = 0; step <= 50; step++) {
  const travel = step / 50;
  for (let a = 0; a < VISIBLE; a++) {
    for (let b = a + 1; b < VISIBLE; b++) {
      const pa = posAt(a, travel);
      const pb = posAt(b, travel);
      // Both off-screen left together doesn't matter — nothing is visible yet.
      if (pa.x < -60 && pb.x < -60) continue;
      const dist = Math.hypot((pa.x - pb.x) * sx, pa.y - pb.y);
      const need = rested[a].r + rested[b].r;
      const gap = dist - need;
      if (gap < worst.gap) worst = { gap, a, b, travel: +travel.toFixed(2) };
      if (gap < 0) transitClashes++;
    }
  }
}
if (transitClashes) {
  console.log(
    `transit FAIL  ${transitClashes} overlapping sample(s); worst nodes ${worst.a}&${worst.b} at travel ${worst.travel} overlap by ${(-worst.gap).toFixed(0)}px`,
  );
} else {
  console.log(
    `transit ok    closest approach ${worst.gap.toFixed(0)}px (nodes ${worst.a}&${worst.b} at travel ${worst.travel})`,
  );
}

const rightmost = Math.max(...rested.map((n) => n.x * sx + n.r));
const inside = rightmost <= PANEL_W;
console.log(
  `edge  ${inside ? 'ok   ' : 'FAIL '} rightmost node edge ${rightmost.toFixed(0)}px of ${PANEL_W}px panel`,
);

const total = failures + tight + transitClashes + (inside ? 0 : 1);
console.log(total ? `\n${total} problem(s)` : `\nall checks passed (${tracks.length} tracks)`);
process.exit(total ? 1 : 0);
