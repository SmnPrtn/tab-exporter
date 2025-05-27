// Konstanten
const OPENER_URL = 'https://tab-exporter.github.io/open/';
const MAX_URL_LENGTH = 8000; // Sicherheitslimit für URL-Länge

// DOM Elemente
const elements = {
  tabCount: document.getElementById('tabCount'),
  exportBtn: document.getElementById('exportBtn'),
  result: document.getElementById('result'),
  linkPreview: document.getElementById('linkPreview'),
  copyBtn: document.getElementById('copyBtn'),
  error: document.getElementById('error'),
  errorMessage: document.getElementById('errorMessage')
};

// Initialisierung
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    await updateTabCount();
    elements.exportBtn.addEventListener('click', handleExport);
    elements.copyBtn.addEventListener('click', handleCopy);
  } catch (error) {
    showError('Initialisierungsfehler: ' + error.message);
  }
}

// Tab-Anzahl aktualisieren
async function updateTabCount() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const count = tabs.length;
    elements.tabCount.textContent = `${count} ${count === 1 ? 'Tab' : 'Tabs'}`;
  } catch (error) {
    console.error('Fehler beim Abrufen der Tabs:', error);
    elements.tabCount.textContent = '? Tabs';
  }
}

// Export-Funktion
async function handleExport() {
  try {
    hideError();
    hideResult();
    
    // Tabs abrufen
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    if (tabs.length === 0) {
      showError('Keine Tabs zum Exportieren gefunden.');
      return;
    }
    
    // URLs extrahieren und filtern
    const urls = tabs
      .map(tab => tab.url)
      .filter(url => isValidUrl(url));
    
    if (urls.length === 0) {
      showError('Keine gültigen URLs zum Exportieren gefunden.');
      return;
    }
    
    // Link erstellen
    const exportLink = createExportLink(urls);
    
    if (exportLink.length > MAX_URL_LENGTH) {
      showError(`Der Link ist zu lang (${urls.length} Tabs). Bitte reduzieren Sie die Anzahl der Tabs.`);
      return;
    }
    
    // Link kopieren und anzeigen
    await copyToClipboard(exportLink);
    showResult(exportLink);
    
  } catch (error) {
    console.error('Export-Fehler:', error);
    showError('Fehler beim Erstellen des Links: ' + error.message);
  }
}

// Erneut kopieren
async function handleCopy() {
  try {
    const link = elements.linkPreview.textContent;
    await copyToClipboard(link);
    
    // Visuelles Feedback
    elements.copyBtn.textContent = 'Kopiert!';
    setTimeout(() => {
      elements.copyBtn.textContent = 'Erneut kopieren';
    }, 2000);
    
  } catch (error) {
    showError('Fehler beim Kopieren: ' + error.message);
  }
}

// URL-Validierung
function isValidUrl(url) {
  if (!url) return false;
  
  // Chrome-interne URLs ausschließen
  const invalidProtocols = ['chrome:', 'chrome-extension:', 'about:', 'data:', 'file:'];
  return !invalidProtocols.some(protocol => url.startsWith(protocol));
}

// Export-Link erstellen
function createExportLink(urls) {
  // URLs als Base64 kodieren für sichere Übertragung
  const data = {
    urls: urls,
    version: 1,
    timestamp: Date.now()
  };
  
  const encoded = btoa(JSON.stringify(data));
  return `${OPENER_URL}#${encoded}`;
}

// In Zwischenablage kopieren
async function copyToClipboard(text) {
  try {
    // Moderne Clipboard API verwenden
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback für ältere Browser
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch (error) {
    throw new Error('Kopieren fehlgeschlagen');
  }
}

// UI-Funktionen
function showResult(link) {
  elements.linkPreview.textContent = link;
  elements.result.classList.remove('hidden');
}

function hideResult() {
  elements.result.classList.add('hidden');
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.error.classList.remove('hidden');
}

function hideError() {
  elements.error.classList.add('hidden');
}