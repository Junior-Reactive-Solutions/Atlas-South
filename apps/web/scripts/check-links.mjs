/**
 * Fails if any internal link in the app points somewhere the router can't serve.
 *
 * Written after the client reported that "most of the links on the home page lead to
 * empty pages with Page Not Found". Two separate causes were found, and this script exists
 * so neither can come back silently:
 *   1. a nav/content path with no matching <Route> in App.tsx  → the app's own 404
 *   2. a `/path#anchor` link whose `id` isn't rendered anywhere → lands at the top of the
 *      page instead of the section it promised (how /company#vision failed — the nav item
 *      existed, the section never did)
 *
 * Deliberately source-parsing rather than crawling a running site: it needs no server, no
 * database and no network, so it can run in CI on a bare checkout.
 *
 * Run: node apps/web/scripts/check-links.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webSrc = resolve(__dirname, '../src');
const navFile = resolve(__dirname, '../../../packages/shared/src/constants/navigation.ts');
const contentDir = resolve(__dirname, '../../../packages/shared/src/content');

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(webSrc).filter((f) => /\.tsx?$/.test(f));
const appTsx = readFileSync(join(webSrc, 'App.tsx'), 'utf8');
const allSource = sourceFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

// ---- 1. What routes exist? -------------------------------------------------------------
// Literal `path="..."` values, plus the four nav collections rendered via stubRoutes(),
// plus PACKAGES_PAGE.path — those are real routes even though their paths aren't literals here.
const literalRoutes = new Set([...appTsx.matchAll(/path="([^"]+)"/g)].map((m) => m[1]));

const navSource = readFileSync(navFile, 'utf8');
const navPaths = [...navSource.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
const stubbedCollections = /stubRoutes\(HARD_SERVICES/.test(appTsx);
if (stubbedCollections) {
  // stubRoutes() is called for HARD_SERVICES, SOFT_SERVICES, INDUSTRIES and SERVICE_AREAS,
  // so every path in those collections resolves. Company/legal/packages paths are literals
  // in App.tsx and are already covered above.
  for (const p of navPaths) {
    if (/^\/(hard-services|soft-services|industries|areas)\//.test(p)) literalRoutes.add(p);
  }
}

// Routes registered as `path={SOME_ITEM.path}` rather than a string literal — resolve the
// referenced constant out of navigation.ts so they don't read as missing.
for (const m of appTsx.matchAll(/path=\{([A-Z_]+)\.path\}/g)) {
  const constName = m[1];
  const decl = navSource.match(new RegExp(`${constName}[^=]*=\\s*\\{[^}]*?path:\\s*'([^']+)'`, 's'));
  if (decl) literalRoutes.add(decl[1]);
}

const hasCatchAll = literalRoutes.has('*');

// ---- 2. What anchor ids exist? ---------------------------------------------------------
const anchorIds = new Set([...allSource.matchAll(/\bid="([A-Za-z][\w-]*)"/g)].map((m) => m[1]));

// ---- 3. Collect every internal link target --------------------------------------------
const targets = new Map(); // target -> where it came from

for (const p of navPaths) targets.set(p, 'navigation.ts');

for (const file of readdirSync(contentDir).filter((f) => f.endsWith('.ts'))) {
  const src = readFileSync(join(contentDir, file), 'utf8');
  for (const m of src.matchAll(/"path":\s*"([^"]+)"|path:\s*'([^']+)'/g)) {
    const value = m[1] ?? m[2];
    if (value?.startsWith('/')) targets.set(value, `shared/content/${file}`);
  }
}

// `to="/literal"` in components, skipping template literals (dynamic, can't be checked here)
for (const file of sourceFiles) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\bto="(\/[^"{}]*)"/g)) {
    if (!targets.has(m[1])) targets.set(m[1], file.replace(webSrc, 'src'));
  }
}

// ---- 4. Verify -------------------------------------------------------------------------
const problems = [];

for (const [target, source] of targets) {
  const [path, hash] = target.split('#');

  if (!literalRoutes.has(path)) {
    // A catch-all route means this renders the app's own 404 page rather than crashing —
    // still a dead link to the visitor, so still a failure.
    problems.push(
      `${target}  (${source})  → no matching route in App.tsx${hasCatchAll ? ' — would render the 404 page' : ''}`,
    );
    continue;
  }

  if (hash && !anchorIds.has(hash)) {
    problems.push(`${target}  (${source})  → no element renders id="${hash}"`);
  }
}

console.log(`Checked ${targets.size} internal link targets against ${literalRoutes.size} routes and ${anchorIds.size} anchor ids.`);

if (problems.length > 0) {
  console.error(`\n${problems.length} broken link target(s):\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}

console.log('All internal link targets resolve.');
