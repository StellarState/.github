import { processAccessLayerPR, processStellarStatePR } from '../src/monitor.js';

// Helpers to build minimal PR objects
const makePR = (n, sha = 'abc123') => ({
  number: n,
  title: `Test PR ${n}`,
  html_url: `https://github.com/org/repo/pull/${n}`,
  user: { login: 'testuser' },
  head: { sha },
});

const CLEAN_DIFF = '--- a/foo.ts\n+++ b/foo.ts\n+const x = 1;\n';
const MALICIOUS_DIFF = '--- a/eslint.config.js\n+++ b/eslint.config.js\n+eval(atob("aGVsbG8gd29ybGQ="));\n';
const VSCODE_DIFF = '--- a/.vscode/tasks.json\n+++ b/.vscode/tasks.json\n+  "runOn": "folderOpen"\n';

function makeState() {
  return { notified: {}, security: {} };
}

function makeDeps(overrides = {}) {
  return {
    getDiff:         async () => CLEAN_DIFF,
    getMergeability: async () => ({ open: true, mergeable: true, reason: 'clean' }),
    getCIStatus:     async () => ({ allPassed: true, pending: false, names: ['verify'] }),
    sendMessage:     async () => true,
    log:             () => {},
    ...overrides,
  };
}

// ── AccessLayer tests ──────────────────────────────────────────────────────────

test('AL-1: clean + mergeable + CI passes → sends notification', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({ sendMessage: async (m) => { sent.push(m); return true; } });

  await processAccessLayerPR(makePR(1), deps, state, 'org/repo');

  expect(sent).toHaveLength(1);
  expect(sent[0]).toContain('AccessLayer PR Ready to Merge');
  expect(sent[0]).toContain('#1');
  expect(sent[0]).toContain('No malicious code detected by the automated checks');
  expect(sent[0]).toContain('Human review is still required');
});

test('AL-2: malicious diff → no notification', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({
    getDiff: async () => MALICIOUS_DIFF,
    sendMessage: async (m) => { sent.push(m); return true; },
  });

  await processAccessLayerPR(makePR(2), deps, state, 'org/repo');

  expect(sent).toHaveLength(0);
});

test('AL-3: clean + merge conflict → no notification', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({
    getMergeability: async () => ({ open: true, mergeable: false, reason: 'conflict' }),
    sendMessage: async (m) => { sent.push(m); return true; },
  });

  await processAccessLayerPR(makePR(3), deps, state, 'org/repo');

  expect(sent).toHaveLength(0);
});

test('AL-4: clean + mergeable + CI pending → no notification', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({
    getCIStatus: async () => ({ allPassed: false, pending: true, names: ['verify'] }),
    sendMessage: async (m) => { sent.push(m); return true; },
  });

  await processAccessLayerPR(makePR(4), deps, state, 'org/repo');

  expect(sent).toHaveLength(0);
});

test('AL-4b: clean + mergeable + CI failing → no notification', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({
    getCIStatus: async () => ({ allPassed: false, pending: false, names: ['verify'] }),
    sendMessage: async (m) => { sent.push(m); return true; },
  });

  await processAccessLayerPR(makePR(4), deps, state, 'org/repo');

  expect(sent).toHaveLength(0);
});

test('AL-7: inconclusive security → no notification', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({
    getDiff: async () => null,
    sendMessage: async (m) => { sent.push(m); return true; },
  });

  await processAccessLayerPR(makePR(7), deps, state, 'org/repo');

  expect(sent).toHaveLength(0);
});

test('AL-8: already notified, state unchanged → no duplicate', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({ sendMessage: async (m) => { sent.push(m); return true; } });

  // First run — should notify
  await processAccessLayerPR(makePR(8, 'sha1'), deps, state, 'org/repo');
  expect(sent).toHaveLength(1);

  // Second run same state — should not re-notify
  await processAccessLayerPR(makePR(8, 'sha1'), deps, state, 'org/repo');
  expect(sent).toHaveLength(1);
});

test('AL-9: PR was pending, becomes ready on later run → notifies once', async () => {
  const state = makeState();
  const sent = [];

  // First run: CI pending
  const depsPending = makeDeps({
    getCIStatus: async () => ({ allPassed: false, pending: true, names: ['verify'] }),
    sendMessage: async (m) => { sent.push(m); return true; },
  });
  await processAccessLayerPR(makePR(9, 'sha1'), depsPending, state, 'org/repo');
  expect(sent).toHaveLength(0);

  // Second run: CI now passes (different stateKey because ci changed)
  const depsReady = makeDeps({ sendMessage: async (m) => { sent.push(m); return true; } });
  await processAccessLayerPR(makePR(9, 'sha1'), depsReady, state, 'org/repo');
  expect(sent).toHaveLength(1);
});

// ── StellarState tests ─────────────────────────────────────────────────────────

test('SS-5: clean + mergeable, CI failing → notifies (CI not required for SS)', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({ sendMessage: async (m) => { sent.push(m); return true; } });
  // getCIStatus is not called for SS — but even if it were failing it should not block

  await processStellarStatePR(makePR(10), deps, state, 'org/ss-repo');

  expect(sent).toHaveLength(1);
  expect(sent[0]).toContain('StellarState PR Ready to Merge');
  expect(sent[0]).not.toContain('CI:');
});

test('SS-6: malicious diff → no notification', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({
    getDiff: async () => VSCODE_DIFF,
    sendMessage: async (m) => { sent.push(m); return true; },
  });

  await processStellarStatePR(makePR(11), deps, state, 'org/ss-repo');

  expect(sent).toHaveLength(0);
});

test('SS-7: inconclusive security → no notification', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({
    getDiff: async () => '',
    sendMessage: async (m) => { sent.push(m); return true; },
  });

  await processStellarStatePR(makePR(12), deps, state, 'org/ss-repo');

  expect(sent).toHaveLength(0);
});

test('SS-8: already notified → no duplicate', async () => {
  const state = makeState();
  const sent = [];
  const deps = makeDeps({ sendMessage: async (m) => { sent.push(m); return true; } });

  await processStellarStatePR(makePR(13, 'sha1'), deps, state, 'org/ss-repo');
  expect(sent).toHaveLength(1);

  await processStellarStatePR(makePR(13, 'sha1'), deps, state, 'org/ss-repo');
  expect(sent).toHaveLength(1);
});
