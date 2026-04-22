function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name) || '';
}

document.addEventListener('DOMContentLoaded', async () => {
  const url = getParam('u');
  const domain = getParam('d');
  const score = getParam('s');

  document.getElementById('url').textContent = url || '—';
  document.getElementById('domain').textContent = domain || '—';
  document.getElementById('score').textContent = score || '—';

  document.getElementById('back').addEventListener('click', () => {
    try { window.history.back(); } catch { window.close(); }
  });

  document.getElementById('proceed').addEventListener('click', async () => {
    if (!url) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    chrome.tabs.update(tab.id, { url });
  });
});

