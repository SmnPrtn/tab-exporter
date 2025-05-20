document.getElementById('generate').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabs = await chrome.tabs.query({});
  const urls = tabs
    .map(tab => tab.url)
    .filter(url => url.startsWith('http'))
    .map(url => encodeURIComponent(url))
    .join(',');
  const baseUrl = 'https://dein-internes-hosting/open-tabs.html?urls=';
  const fullUrl = baseUrl + urls;
  try {
    await navigator.clipboard.writeText(fullUrl);
    document.getElementById('status').textContent = 'Link in Zwischenablage kopiert!';
  } catch (err) {
    document.getElementById('status').textContent = 'Fehler beim Kopieren des Links.';
  }
});
