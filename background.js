// Background script für erweiterte Funktionalität
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Exporter Extension installiert');
});

// Funktion zum Speichern und Löschen von Tab-Sets
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveTabs') {
    const { tabData, setName } = message;
    // Speichern im Chrome Storage
    chrome.storage.local.get('savedTabSets', (result) => {
      const savedSets = result.savedTabSets || {};
      savedSets[setName] = tabData;
      chrome.storage.local.set({ savedTabSets: savedSets }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // Für asynchrone Antwort
  }
  
  if (message.action === 'getSavedSets') {
    chrome.storage.local.get('savedTabSets', (result) => {
      sendResponse({ sets: result.savedTabSets || {} });
    });
    return true; // Für asynchrone Antwort
  }
  
  if (message.action === 'deleteSet') {
    const { setName } = message;
    chrome.storage.local.get('savedTabSets', (result) => {
      const savedSets = result.savedTabSets || {};
      if (savedSets[setName]) {
        delete savedSets[setName];
        chrome.storage.local.set({ savedTabSets: savedSets }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: 'Set not found' });
      }
    });
    return true; // Für asynchrone Antwort
  }
});
