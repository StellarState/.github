import { createClient, listOpenPRs, getPRDiff, getMergeability, getCIStatus } from './github.js';
import { sendTelegram } from './telegram.js';
import { loadState, saveState } from './state.js';
import { processAccessLayerPR, processStellarStatePR } from './monitor.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, '..', 'state.json');

const REPOS = {
  accesslayer: [
    { owner: 'accesslayerorg', repo: 'accesslayer-client' },
    { owner: 'accesslayerorg', repo: 'accesslayer-contracts' },
    { owner: 'accesslayerorg', repo: 'accesslayer-server' },
  ],
  stellarstate: [
    { owner: 'StellarState', repo: 'SS-frontend' },
    { owner: 'StellarState', repo: 'SS-backend' },
    { owner: 'StellarState', repo: 'SS-contracts' },
  ],
};

async function run() {
  const ghToken = process.env.GITHUB_TOKEN;
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChat  = process.env.TELEGRAM_CHAT_ID;

  if (!ghToken) {
    console.error('[monitor] GITHUB_TOKEN is required');
    process.exit(1);
  }

  const octokit = createClient(ghToken);
  const state   = loadState(STATE_FILE);
  const log     = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

  // --- AccessLayer repos ---
  for (const { owner, repo } of REPOS.accesslayer) {
    log(`scanning ${owner}/${repo}`);
    let prs;
    try {
      prs = await listOpenPRs(octokit, owner, repo);
    } catch (err) {
      log(`ERROR listing PRs for ${owner}/${repo}: ${err.message}`);
      continue;
    }

    log(`  ${prs.length} open PRs`);
    const repoKey = `${owner}/${repo}`;

    for (const pr of prs) {
      try {
        await processAccessLayerPR(pr, {
          getDiff:        (n) => getPRDiff(octokit, owner, repo, n),
          getMergeability:(n) => getMergeability(octokit, owner, repo, n),
          getCIStatus:    (sha) => getCIStatus(octokit, owner, repo, sha),
          sendMessage:    (text) => sendTelegram(tgToken, tgChat, text),
          log,
        }, state, repoKey);
      } catch (err) {
        log(`ERROR processing ${repoKey}#${pr.number}: ${err.message}`);
      }
    }
  }

  // --- StellarState repos ---
  for (const { owner, repo } of REPOS.stellarstate) {
    log(`scanning ${owner}/${repo}`);
    let prs;
    try {
      prs = await listOpenPRs(octokit, owner, repo);
    } catch (err) {
      log(`ERROR listing PRs for ${owner}/${repo}: ${err.message}`);
      continue;
    }

    log(`  ${prs.length} open PRs`);
    const repoKey = `${owner}/${repo}`;

    for (const pr of prs) {
      try {
        await processStellarStatePR(pr, {
          getDiff:        (n) => getPRDiff(octokit, owner, repo, n),
          getMergeability:(n) => getMergeability(octokit, owner, repo, n),
          sendMessage:    (text) => sendTelegram(tgToken, tgChat, text),
          log,
        }, state, repoKey);
      } catch (err) {
        log(`ERROR processing ${repoKey}#${pr.number}: ${err.message}`);
      }
    }
  }

  saveState(STATE_FILE, state);
  log('run complete');
}

run();
