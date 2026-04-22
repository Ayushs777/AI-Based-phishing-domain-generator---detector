const DEFAULT_API_BASE = 'http://127.0.0.1:8000';
const cache = {};

async function getApiBase() {
  const stored = await chrome.storage.local.get('PG_API_BASE');
  const raw = stored.PG_API_BASE || DEFAULT_API_BASE;
  return String(raw).replace(/\/+$/, '');
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = details.url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;

  try {
    let data = cache[url];
    if (!data) {
      const API_BASE = await getApiBase();
      const res = await fetch(`${API_BASE}/api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      data = await res.json();
      cache[url] = data;
      setTimeout(() => delete cache[url], 3600000);
    }

    const score = data.risk_score || 0;
    const tabId = details.tabId;
    const domain = data.domain || (() => {
      try { return new URL(url).hostname; } catch { return ''; }
    })();

    if (score >= 70) {
      chrome.action.setBadgeText({ text: '!', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#e24b4a', tabId });

      // Show an interstitial warning to reduce accidental credential entry.
      // MV3 cannot reliably "block before request" via webNavigation, so we redirect after commit.
      const warningUrl = chrome.runtime.getURL(
        `warning.html?u=${encodeURIComponent(url)}&d=${encodeURIComponent(domain)}&s=${encodeURIComponent(Math.round(score))}`
      );
      chrome.tabs.update(tabId, { url: warningUrl });

      // Optional: could show a notification, but we avoid requiring an icon asset.
    } else if (score >= 40) {
      chrome.action.setBadgeText({ text: '?', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#f0994b', tabId });
    } else {
      chrome.action.setBadgeText({ text: '✓', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#639922', tabId });
    }

    await chrome.storage.local.set({ [`result_${tabId}`]: data });
  } catch (e) {
    console.error('PhishGuard error:', e);
    // chrome.action.setBadgeText({ text: '?', tabId: details.tabId });
    // chrome.action.setBadgeBackgroundColor({ color: '#555', tabId: details.tabId });
  }
});
