/**
 * Core monitoring logic — separated from I/O so it can be unit-tested.
 * All side effects (GitHub API, Telegram, state persistence) are injected.
 */

import { inspectDiff } from './security.js';
import {
  prStateKey,
  alreadyNotified,
  markNotified,
  markSecurity,
  getCachedSecurity,
} from './state.js';
import { buildAccessLayerMessage, buildStellarStateMessage } from './telegram.js';

/**
 * Process a single PR according to the AccessLayer policy:
 *   security CLEAN + mergeable + all CI passing → notify
 */
export async function processAccessLayerPR(pr, deps, state, repoKey) {
  const { getDiff, getMergeability, getCIStatus, sendMessage, log } = deps;
  const num = pr.number;

  log(`[AL #${num}] checking ${pr.title}`);

  // --- Security ---
  let secResult = getCachedSecurity(state, repoKey, num, pr.head.sha);
  if (!secResult) {
    const diff = await getDiff(num);
    const inspection = inspectDiff(diff);
    secResult = inspection.result;
    markSecurity(state, repoKey, num, pr.head.sha, secResult);
    log(`[AL #${num}] security: ${secResult} (indicators: ${inspection.indicators.join(',') || 'none'})`);
  } else {
    log(`[AL #${num}] security: ${secResult} (cached)`);
  }

  if (secResult === 'MALICIOUS') {
    log(`[AL #${num}] skipping — malicious code detected`);
    return;
  }
  if (secResult === 'INCONCLUSIVE') {
    log(`[AL #${num}] skipping — security result inconclusive`);
    return;
  }

  // --- Mergeability ---
  const mergeability = await getMergeability(num);
  if (!mergeability.open) {
    log(`[AL #${num}] skipping — PR no longer open`);
    return;
  }
  if (mergeability.mergeable === null) {
    log(`[AL #${num}] mergeability pending — will retry next run`);
    return;
  }
  if (!mergeability.mergeable) {
    log(`[AL #${num}] not mergeable: ${mergeability.reason}`);
    return;
  }

  // --- CI ---
  const ci = await getCIStatus(pr.head.sha);
  if (ci.pending) {
    log(`[AL #${num}] CI still pending — will retry next run`);
    return;
  }
  if (!ci.allPassed) {
    log(`[AL #${num}] CI not passing (checks: ${ci.names.join(', ')})`);
    return;
  }

  // --- Dedup ---
  const key = prStateKey(pr, mergeability.mergeable, ci.allPassed);
  if (alreadyNotified(state, repoKey, num, key)) {
    log(`[AL #${num}] already notified for this state — skipping`);
    return;
  }

  // --- Notify ---
  const prInfo = { number: num, title: pr.title, author: pr.user.login, url: pr.html_url };
  const sent = await sendMessage(buildAccessLayerMessage(prInfo));
  if (sent) {
    markNotified(state, repoKey, num, key);
    log(`[AL #${num}] notified ✓`);
  }
}

/**
 * Process a single PR according to the StellarState policy:
 *   security CLEAN + mergeable → notify (CI not required)
 */
export async function processStellarStatePR(pr, deps, state, repoKey) {
  const { getDiff, getMergeability, sendMessage, log } = deps;
  const num = pr.number;

  log(`[SS #${num}] checking ${pr.title}`);

  // --- Security ---
  let secResult = getCachedSecurity(state, repoKey, num, pr.head.sha);
  if (!secResult) {
    const diff = await getDiff(num);
    const inspection = inspectDiff(diff);
    secResult = inspection.result;
    markSecurity(state, repoKey, num, pr.head.sha, secResult);
    log(`[SS #${num}] security: ${secResult} (indicators: ${inspection.indicators.join(',') || 'none'})`);
  } else {
    log(`[SS #${num}] security: ${secResult} (cached)`);
  }

  if (secResult === 'MALICIOUS') {
    log(`[SS #${num}] skipping — malicious code detected`);
    return;
  }
  if (secResult === 'INCONCLUSIVE') {
    log(`[SS #${num}] skipping — security result inconclusive`);
    return;
  }

  // --- Mergeability ---
  const mergeability = await getMergeability(num);
  if (!mergeability.open) {
    log(`[SS #${num}] skipping — PR no longer open`);
    return;
  }
  if (mergeability.mergeable === null) {
    log(`[SS #${num}] mergeability pending — will retry next run`);
    return;
  }
  if (!mergeability.mergeable) {
    log(`[SS #${num}] not mergeable: ${mergeability.reason}`);
    return;
  }

  // --- Dedup ---
  const key = prStateKey(pr, mergeability.mergeable, 'no-ci-required');
  if (alreadyNotified(state, repoKey, num, key)) {
    log(`[SS #${num}] already notified for this state — skipping`);
    return;
  }

  // --- Notify ---
  const prInfo = { number: num, title: pr.title, author: pr.user.login, url: pr.html_url };
  const sent = await sendMessage(buildStellarStateMessage(prInfo));
  if (sent) {
    markNotified(state, repoKey, num, key);
    log(`[SS #${num}] notified ✓`);
  }
}
