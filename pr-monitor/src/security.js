/**
 * Security inspection for PR diffs.
 * Returns 'CLEAN', 'MALICIOUS', or 'INCONCLUSIVE'.
 *
 * CLEAN      — diff inspected, no indicators found
 * MALICIOUS  — one or more high-confidence indicators found
 * INCONCLUSIVE — diff could not be fetched or inspection was incomplete
 */

export const MALICIOUS_PATTERNS = [
  // PolinRider: obfuscated hex string arrays
  { id: 'HEX_ARRAY',       re: /('[0-9a-f]{6,}','[0-9a-f]{6,}'[^)]{0,200}){3,}|Math\.(ceil|floor|trunc)\(parseInt\(0x[0-9a-f]+\)\)/i },
  // Long obfuscated line (payload hidden after spaces)
  { id: 'LONG_LINE',       fn: (line) => line.length > 500 && /eval|spawn|require|parseInt|parseFloat/i.test(line) },
  // eval() or spawn() in config files
  { id: 'EVAL_SPAWN',      re: /\beval\s*\(|\bspawn\s*\(/ },
  // Suspicious require() of system modules in config files
  { id: 'SUSP_REQUIRE',    re: /require\s*\(\s*['"]https?['"]|require\s*\(\s*['"]zlib['"]|require\s*\(\s*['"]child_process['"]/ },
  // VS Code auto-task on folder open (match key presence — value check is enough signal)
  { id: 'VSCODE_AUTOTASK', re: /runOn|allowAutomaticTasks/i },
  // Known PolinRider font delivery filenames
  { id: 'SUSP_FONT',       re: /fa-solid-\d+\.(woff2?|eot|ttf|lik)|fa-solid\.(lik|lfk)/i },
  // dist/setup.js loader or preinstall hook
  { id: 'SETUP_JS',        re: /dist\/setup\.js|"preinstall"\s*:/ },
  // api.js wired into start/dev scripts
  { id: 'API_JS_SCRIPT',   re: /"(start|dev)"\s*:\s*"[^"]*api\.js/ },
  // Known PolinRider marker strings
  { id: 'MARKER',          re: /rmcej%otb%|Cot%3T=sthP|_\$__1e42/ },
  // Suspicious .github/workflows modification adding curl/wget/eval
  { id: 'WORKFLOW_EXEC',   re: /curl\s+.*(sh|bash|exec)|wget\s+.*\|\s*(sh|bash)|eval\s*\$\(/ },
];

/**
 * @param {string} diff  Raw unified diff text for the PR
 * @returns {{ result: 'CLEAN'|'MALICIOUS'|'INCONCLUSIVE', indicators: string[] }}
 */
export function inspectDiff(diff) {
  if (!diff || typeof diff !== 'string' || diff.trim() === '') {
    return { result: 'INCONCLUSIVE', indicators: ['EMPTY_DIFF'] };
  }

  const addedLines = diff
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'));

  const indicators = [];

  for (const line of addedLines) {
    const content = line.slice(1);
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.fn) {
        if (pattern.fn(content) && !indicators.includes(pattern.id)) {
          indicators.push(pattern.id);
        }
      } else if (pattern.re) {
        if (pattern.re.test(content) && !indicators.includes(pattern.id)) {
          indicators.push(pattern.id);
        }
      }
    }
  }

  if (indicators.length > 0) {
    return { result: 'MALICIOUS', indicators };
  }

  return { result: 'CLEAN', indicators: [] };
}
