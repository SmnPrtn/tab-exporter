// Globale Variablen
let allTabs = [];
let currentWindowId = null;
let showAllWindowsMode = true;

// Funktion zum Laden aller geöffneten Tabs
async function loadTabs() {
    // Aktuelle Fenster-ID speichern
    let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentWindowId = activeTab.windowId;
    
    // Alle Tabs laden
    allTabs = await chrome.tabs.query({});
    
    // Tabs basierend auf aktueller Einstellung anzeigen
    displayFilteredTabs();
}

// Funktion zum Filtern und Anzeigen der Tabs
function displayFilteredTabs() {
    let filteredTabs;
    
    if (showAllWindowsMode) {
        // Alle Fenster anzeigen
        filteredTabs = allTabs;
        document.getElementById('showAllWindows').classList.add('active');
        document.getElementById('showCurrentWindow').classList.remove('active');
    } else {
        // Nur aktuelles Fenster anzeigen
        filteredTabs = allTabs.filter(tab => tab.windowId === currentWindowId);
        document.getElementById('showAllWindows').classList.remove('active');
        document.getElementById('showCurrentWindow').classList.add('active');
    }
    
    displayTabs(filteredTabs);
}

// Anzeigen der Tabs mit Checkboxen
function displayTabs(tabs) {
    const tabList = document.getElementById('tabList');
    tabList.innerHTML = '';
    
    tabs.forEach((tab, index) => {
        if (tab.url.startsWith('http')) {
            const tabItem = document.createElement('div');
            tabItem.className = 'tab-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.dataset.tabId = tab.id;
            
            const favicon = document.createElement('img');
            favicon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>';
            favicon.onerror = () => {
                favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>';
            };
            
            const title = document.createElement('div');
            title.className = 'tab-title';
            title.textContent = tab.title;
            title.title = tab.url; // Tooltip mit vollständiger URL
            
            tabItem.appendChild(checkbox);
            tabItem.appendChild(favicon);
            tabItem.appendChild(title);
            tabList.appendChild(tabItem);
        }
    });
}

// Generieren eines Links für ausgewählte Tabs
async function generateLink() {
    const selectedTabIds = Array.from(document.querySelectorAll('#tabList input[type="checkbox"]:checked'))
        .map(checkbox => parseInt(checkbox.dataset.tabId));
    
    if (selectedTabIds.length === 0) {
        showStatus('Please choose one tab!', true);
        return;
    }
    
    // Tabs basierend auf den IDs finden
    const selectedTabs = allTabs.filter(tab => selectedTabIds.includes(tab.id));
    
    // URLs für den Link vorbereiten
    const urls = selectedTabs
        .map(tab => tab.url)
        .filter(url => url.startsWith('http'))
        .map(url => encodeURIComponent(url))
        .join(',');
    
    // Prüfen der URL-Länge
    if (urls.length > 7000) {
        showStatus('Warning: This URL is to long, choose less tabs.', true);
    }
    
    const baseUrl = 'https://smnprtn.github.io/tab-exporter/open-tabs.html?urls=';
    const fullUrl = baseUrl + urls;
    
    try {
        await navigator.clipboard.writeText(fullUrl);
        showStatus(`Link for tab-set ${selectedTabIds.length} has been saved in your clipboard!`);
    } catch (err) {
        showStatus('Fehler beim Kopieren des Links: ' + err.message, true);
    }
}

// Tab-Set mit Namen speichern
async function saveTabSet() {
    const setName = document.getElementById('setName').value.trim();
    
    if (!setName) {
        showStatus('Give your tab-set a name!', true);
        return;
    }
    
    const selectedTabIds = Array.from(document.querySelectorAll('#tabList input[type="checkbox"]:checked'))
        .map(checkbox => parseInt(checkbox.dataset.tabId));
    
    if (selectedTabIds.length === 0) {
        showStatus('Please choose one tab!', true);
        return;
    }
    
    // Tabs basierend auf den IDs finden
    const selectedTabs = allTabs.filter(tab => selectedTabIds.includes(tab.id))
        .map(tab => {
            return {
                url: tab.url,
                title: tab.title,
                favIconUrl: tab.favIconUrl
            };
        });
    
    // Zum Background-Script senden zum Speichern
    chrome.runtime.sendMessage(
        {
            action: 'saveTabs',
            tabData: selectedTabs,
            setName: setName
        },
        response => {
            if (response && response.success) {
                document.getElementById('setName').value = '';
                document.getElementById('saveForm').style.display = 'none';
                showStatus(`Tab-Set "${setName}" saved successfully!`);
                loadSavedSets();
            } else {
                showStatus('Error while saving tab-sets!', true);
            }
        }
    );
}

// Statusnachricht anzeigen
function showStatus(message, isError = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    
    if (isError) {
        status.className = 'error';
    } else {
        status.className = '';
    }
    
    // Nach 5 Sekunden automatisch ausblenden
    setTimeout(() => {
        status.textContent = '';
        status.className = '';
    }, 5000);
}

// Gespeicherte Tab-Sets laden und anzeigen
function loadSavedSets() {
    chrome.runtime.sendMessage({ action: 'getSavedSets' }, response => {
        const savedSetsList = document.getElementById('savedSetsList');
        savedSetsList.innerHTML = '';
        
        if (!response.sets || Object.keys(response.sets).length === 0) {
            savedSetsList.textContent = 'No saved tab-sets here.';
            return;
        }
        
        for (const [name, tabs] of Object.entries(response.sets)) {
            const setItem = document.createElement('div');
            setItem.className = 'tab-item';
            
            const setTitle = document.createElement('div');
            setTitle.className = 'tab-title';
            setTitle.textContent = name + ` (${tabs.length} Tabs)`;
            
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.marginLeft = 'auto';
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.gap = '5px';
            
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy Link';
            copyButton.style.padding = '4px 8px';
            copyButton.style.fontSize = '12px';
            copyButton.addEventListener('click', () => {
                const urls = tabs.map(tab => encodeURIComponent(tab.url)).join(',');
                const baseUrl = 'https://smnprtn.github.io/tab-exporter/open-tabs.html?urls=';
                const fullUrl = baseUrl + urls;
                
                navigator.clipboard.writeText(fullUrl);
                showStatus(`Copy link of set "${name}" in your clipboard!`);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.style.padding = '4px 8px';
            deleteButton.style.fontSize = '12px';
            deleteButton.style.backgroundColor = '#db4437';
            deleteButton.addEventListener('click', () => {
                if (confirm(`Do you really want to delete tab-set "${name}"?`)) {
                    chrome.runtime.sendMessage(
                        { action: 'deleteSet', setName: name },
                        response => {
                            if (response && response.success) {
                                loadSavedSets();
                                showStatus(`Tab-Set "${name}" deleted.`);
                            }
                        }
                    );
                }
            });
            
            buttonsContainer.appendChild(copyButton);
            buttonsContainer.appendChild(deleteButton);
            
            setItem.appendChild(setTitle);
            setItem.appendChild(buttonsContainer);
            savedSetsList.appendChild(setItem);
        }
    });
}

// Event-Listener
document.addEventListener('DOMContentLoaded', () => {
    // Tabs laden
    loadTabs();
    
    // Gespeicherte Sets abrufen
    loadSavedSets();
    
    // Fenster-Auswahl Event-Listener
    document.getElementById('showAllWindows').addEventListener('click', () => {
        showAllWindowsMode = true;
        displayFilteredTabs();
    });
    
    document.getElementById('showCurrentWindow').addEventListener('click', () => {
        showAllWindowsMode = false;
        displayFilteredTabs();
    });
    
    // Event-Listener hinzufügen
    document.getElementById('generate').addEventListener('click', generateLink);
    
    document.getElementById('selectAll').addEventListener('click', () => {
        document.querySelectorAll('#tabList input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
    });
    
    document.getElementById('deselectAll').addEventListener('click', () => {
        document.querySelectorAll('#tabList input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    });
    
    document.getElementById('openSaveForm').addEventListener('click', () => {
        document.getElementById('saveForm').style.display = 'flex';
    });
    
    document.getElementById('saveSet').addEventListener('click', saveTabSet);
});
