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
    if (!url.href.includes('smnprtn.github.io/tab-exporter/open/')) return;
    
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
  // Nichts tun - die GitHub Pages zeigt bereits die Erfolgsmeldung an
  console.log(`${count} Tabs wurden erfolgreich geöffnet`);
  
  // Optional: Den Opener-Tab nach einer kurzen Verzögerung schließen
  // setTimeout(() => {
  //   chrome.tabs.remove(tabId).catch(() => {});
  // }, 3000);
}

// Hilfsfunktion für Verzögerungen
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
