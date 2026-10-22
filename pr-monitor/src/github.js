import { Octokit } from '@octokit/rest';

export function createClient(token) {
  return new Octokit({ auth: token });
}

/**
 * Fetch all open PRs for a repo, paginating automatically.
 */
export async function listOpenPRs(octokit, owner, repo) {
  const prs = await octokit.paginate(octokit.rest.pulls.list, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });
  return prs;
}

/**
 * Fetch the unified diff for a PR.
 * Returns null if the diff cannot be retrieved.
 */
export async function getPRDiff(octokit, owner, repo, pull_number) {
  try {
    const res = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: { format: 'diff' },
    });
    return typeof res.data === 'string' ? res.data : null;
  } catch {
    return null;
  }
}

/**
 * Fetch mergeability for a specific PR.
 * GitHub sometimes returns null while it calculates — we propagate that as null.
 */
export async function getMergeability(octokit, owner, repo, pull_number) {
  try {
    const { data } = await octokit.rest.pulls.get({ owner, repo, pull_number });
    if (data.state !== 'open') return { open: false, mergeable: false, reason: 'PR closed' };
    if (data.mergeable === null) return { open: true, mergeable: null, reason: 'PENDING' };
    if (!data.mergeable) return { open: true, mergeable: false, reason: data.mergeable_state || 'conflict' };
    return { open: true, mergeable: true, reason: data.mergeable_state };
  } catch (err) {
    return { open: false, mergeable: false, reason: `API error: ${err.message}` };
  }
}

/**
 * Fetch check-runs for the PR head SHA.
 * Returns { allPassed: bool, pending: bool, names: string[] }
 */
export async function getCIStatus(octokit, owner, repo, headSha) {
  try {
    const { data } = await octokit.rest.checks.listForRef({
      owner,
      repo,
      ref: headSha,
      per_page: 100,
    });

    const runs = data.check_runs.filter(
      // exclude our own malware-scan workflow from the CI gate
      (r) => r.name !== 'Scan for malicious payloads' && r.name !== 'Malware Scan (PolinRider / Wave)'
    );

    if (runs.length === 0) return { allPassed: false, pending: true, names: [] };

    const pending = runs.some((r) => r.status !== 'completed');
    const allPassed = !pending && runs.every((r) => r.conclusion === 'success');

    return { allPassed, pending, names: runs.map((r) => r.name) };
  } catch (err) {
    return { allPassed: false, pending: false, names: [], error: err.message };
  }
}
