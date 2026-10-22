import { readFileSync, writeFileSync, existsSync } from 'fs';

const DEFAULT_STATE = { notified: {}, security: {} };

/**
 * Load persisted state from a JSON file.
 * The file path is passed in so callers control where state lives
 * (locally vs. a path checked into the repo for GitHub Actions).
 */
export function loadState(filePath) {
  if (!existsSync(filePath)) return structuredClone(DEFAULT_STATE);
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(filePath, state) {
  writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Build a stable key for a PR that encodes its current observable state.
 * If this key changes between runs, we re-evaluate the PR.
 */
export function prStateKey(pr, mergeability, ciAllPassed) {
  return `${pr.head.sha}:mergeable=${mergeability}:ci=${ciAllPassed}`;
}

/**
 * Returns true if the PR has already been notified for this exact state.
 */
export function alreadyNotified(state, repoKey, prNumber, stateKey) {
  return state.notified[`${repoKey}#${prNumber}`] === stateKey;
}

export function markNotified(state, repoKey, prNumber, stateKey) {
  state.notified[`${repoKey}#${prNumber}`] = stateKey;
}

export function markSecurity(state, repoKey, prNumber, sha, result) {
  state.security[`${repoKey}#${prNumber}`] = { sha, result };
}

export function getCachedSecurity(state, repoKey, prNumber, sha) {
  const cached = state.security[`${repoKey}#${prNumber}`];
  if (cached && cached.sha === sha) return cached.result;
  return null;
}
