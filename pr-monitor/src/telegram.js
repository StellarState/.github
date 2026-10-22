const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Send a message via Telegram Bot API.
 * Throws on network error; returns false on API error so caller can retry later.
 */
export async function sendTelegram(token, chatId, text) {
  if (!token || !chatId) {
    console.error('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping');
    return false;
  }

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
  } catch (err) {
    console.error(`[telegram] network error: ${err.message}`);
    return false;
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.ok) {
    // Log without exposing the token
    console.error(`[telegram] API error ${res.status}: ${body.description ?? 'unknown'}`);
    return false;
  }

  return true;
}

export function buildAccessLayerMessage(pr) {
  return [
    `*AccessLayer PR Ready to Merge*`,
    ``,
    `Repository: AccessLayer`,
    `PR: #${pr.number} — ${pr.title}`,
    `Author: @${pr.author}`,
    `URL: ${pr.url}`,
    ``,
    `Security: No malicious code detected by the automated checks`,
    `Mergeability: Mergeable, no conflicts`,
    `CI: All required checks passed`,
    ``,
    `This PR has passed the automated security and CI checks and is ready for manual review and merging.`,
    `Human review is still required before merging.`,
  ].join('\n');
}

export function buildStellarStateMessage(pr) {
  return [
    `*StellarState PR Ready to Merge*`,
    ``,
    `Repository: StellarState`,
    `PR: #${pr.number} — ${pr.title}`,
    `Author: @${pr.author}`,
    `URL: ${pr.url}`,
    ``,
    `Security: No malicious code detected by the automated checks`,
    `Mergeability: Mergeable, no conflicts`,
    ``,
    `This PR has passed the automated security and mergeability checks and is ready for manual review and merging.`,
    `Human review is still required before merging.`,
  ].join('\n');
}
