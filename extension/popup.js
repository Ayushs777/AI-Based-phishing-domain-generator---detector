document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('content');
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const apiBaseInput = document.getElementById('apiBase');
  const webBaseInput = document.getElementById('webBase');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');
  const settingsHint = document.getElementById('settingsHint');

  const DEFAULT_API_BASE = 'http://127.0.0.1:8000';
  const DEFAULT_WEB_BASE = 'http://localhost:5173';

  function normalizeBase(v) {
    return String(v || '').trim().replace(/\/+$/, '');
  }

  async function loadSettings() {
    const stored = await chrome.storage.local.get(['PG_API_BASE', 'PG_WEB_BASE']);
    apiBaseInput.value = normalizeBase(stored.PG_API_BASE || DEFAULT_API_BASE);
    webBaseInput.value = normalizeBase(stored.PG_WEB_BASE || DEFAULT_WEB_BASE);
    settingsHint.textContent = 'Tip: if backend runs on another PC/LAN IP, set it here (e.g. http://192.168.x.x:8000).';
  }

  async function saveSettings() {
    const apiBase = normalizeBase(apiBaseInput.value) || DEFAULT_API_BASE;
    const webBase = normalizeBase(webBaseInput.value) || DEFAULT_WEB_BASE;
    await chrome.storage.local.set({ PG_API_BASE: apiBase, PG_WEB_BASE: webBase });
    settingsHint.textContent = 'Saved. New scans will use updated URLs.';
    setTimeout(() => (settingsHint.textContent = ''), 2500);
  }

  async function resetSettings() {
    await chrome.storage.local.set({ PG_API_BASE: DEFAULT_API_BASE, PG_WEB_BASE: DEFAULT_WEB_BASE });
    await loadSettings();
    settingsHint.textContent = 'Reset to defaults.';
    setTimeout(() => (settingsHint.textContent = ''), 2500);
  }

  settingsToggle.addEventListener('click', async () => {
    const next = settingsPanel.hidden;
    settingsPanel.hidden = !next ? true : false;
    if (!settingsPanel.hidden) await loadSettings();
  });
  saveSettingsBtn.addEventListener('click', saveSettings);
  resetSettingsBtn.addEventListener('click', resetSettings);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const stored = await chrome.storage.local.get(`result_${tab.id}`);
    const data = stored[`result_${tab.id}`];

    if (!data) {
      content.innerHTML = '<div class="loading">No scan data yet.<br><small style="color:#555">Navigate to a webpage to scan it.</small></div>';
      return;
    }

    const score = Math.round(data.risk_score || 0);
    const domain = data.domain || new URL(tab.url).hostname;
    const color = score >= 70 ? '#e24b4a' : score >= 40 ? '#f0994b' : '#639922';
    const bg = score >= 70 ? 'rgba(226,75,74,0.15)' : score >= 40 ? 'rgba(240,153,75,0.15)' : 'rgba(99,153,34,0.15)';
    const verdict = score >= 70 ? 'PHISHING DETECTED' : score >= 40 ? 'SUSPICIOUS' : 'LOOKS SAFE';
    const flags = data.flags || [];
    const settings = await chrome.storage.local.get(['PG_WEB_BASE']);
    const WEB_BASE = normalizeBase(settings.PG_WEB_BASE || DEFAULT_WEB_BASE);

    content.innerHTML = `
      <div class="score-ring">
        <div class="score-num" style="color:${color}">${score}</div>
        <div class="score-label">Risk Score / 100</div>
      </div>
      <div class="bar"><div class="bar-fill" style="width:${score}%;background:${color}"></div></div>
      <div style="text-align:center;margin-bottom:8px">
        <span class="badge" style="background:${bg};color:${color}">${verdict}</span>
      </div>
      <div class="domain">${domain}</div>
      ${flags.length > 0 ? `
        <div class="flags">
          ${flags.slice(0,5).map(f => `<div class="flag-item"><span style="color:#e24b4a">⚡</span>${f}</div>`).join('')}
        </div>` : '<div style="color:#639922;text-align:center;font-size:13px">✅ No threats detected</div>'}
      <a class="btn" href="${WEB_BASE}/check?url=${encodeURIComponent(tab.url)}" target="_blank">View Full Report ↗</a>
    `;
  } catch (e) {
    content.innerHTML = `<div class="loading">Error: ${e.message}</div>`;
  }
});
