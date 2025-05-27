// Service Worker für Tab Exporter
// Behandelt das Öffnen von Export-Links

// Listener für Installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Tab Exporter wurde installiert');
  } else if (details.reason === 'update') {
    console.log('Tab Exporter wurde aktualisiert');
  }
});

// Web Navigation Listener für das Öffnen von Export-Links
chrome.webNavigation.onCommitted.addListener(async (details) => {
  try {
    // Nur Haupt-Frames bearbeiten
    if (details.frameId !== 0) return;
    
    // Prüfen ob es ein Tab-Exporter Link ist
    const url = new URL(details.url);
    if (!url.href.includes('tab-exporter.github.io/open/')) return;
    
    // Hash mit kodierten Daten extrahieren
    const hash = url.hash.slice(1); // # entfernen
    if (!hash) return;
    
    // Daten dekodieren
    let data;
    try {
      data = JSON.parse(atob(hash));
    } catch (e) {
      console.error('Fehler beim Dekodieren der Daten:', e);
      return;
    }
    
    // Validierung
    if (!data.urls || !Array.isArray(data.urls)) {
      console.error('Ungültige Datenstruktur');
      return;
    }
    
    // Tabs im Hintergrund öffnen
    await openTabsInBackground(data.urls, details.tabId);
    
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Links:', error);
  }
});

// Tabs im Hintergrund öffnen
async function openTabsInBackground(urls, openerTabId) {
  try {
    // Aktuelles Fenster abrufen
    const currentWindow = await chrome.windows.getCurrent();
    
    // Opener-Tab Information abrufen
    const openerTab = await chrome.tabs.get(openerTabId);
    const openerIndex = openerTab.index;
    
    // Tabs nacheinander öffnen
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      // URL-Validierung
      if (!isValidUrl(url)) {
        console.warn('Ungültige URL übersprungen:', url);
        continue;
      }
      
      try {
        // Tab im Hintergrund erstellen
        await chrome.tabs.create({
          url: url,
          active: false, // WICHTIG: Tab im Hintergrund öffnen
          windowId: currentWindow.id,
          index: openerIndex + i + 1 // Nach dem Opener-Tab einfügen
        });
        
        // Kleine Verzögerung zwischen Tabs (verhindert Überlastung)
        await delay(50);
        
      } catch (tabError) {
        console.error('Fehler beim Öffnen des Tabs:', url, tabError);
      }
    }
    
    // Opener-Tab schließen oder Erfolgsmeldung anzeigen
    await showSuccessMessage(openerTabId, urls.length);
    
  } catch (error) {
    console.error('Fehler beim Öffnen der Tabs:', error);
  }
}

// URL-Validierung
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    // Nur http(s) URLs erlauben
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Erfolgsmeldung anzeigen
async function showSuccessMessage(tabId, count) {
  try {
    // Script in den Opener-Tab injizieren
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (count) => {
        // Erfolgsseite anzeigen
        document.body.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8f9fa;
            text-align: center;
          ">
            <div style="
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              max-width: 400px;
            ">
              <div style="
                width: 64px;
                height: 64px;
                background-color: #10b981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
              ">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h1 style="
                font-size: 24px;
                font-weight: 600;
                color: #1a1a1a;
                margin: 0 0 12px;
              ">Erfolgreich!</h1>
              <p style="
                font-size: 16px;
                color: #666;
                margin: 0 0 24px;
              ">${count} ${count === 1 ? 'Tab wurde' : 'Tabs wurden'} im Hintergrund geöffnet</p>
              <button onclick="window.close()" style="
                background-color: #1a1a1a;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
              ">Tab schließen</button>
            </div>
          </div>
        `;
      },
      args: [count]
    });
  } catch (error) {
    console.error('Fehler beim Anzeigen der Erfolgsmeldung:', error);
  }
}

// Hilfsfunktion für Verzögerungen
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}