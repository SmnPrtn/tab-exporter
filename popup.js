// Globale Variablen
let allTabs = [];
let popupPermissionGranted = false;

// Funktion zum Laden aller geöffneten Tabs
async function loadTabs() {
  allTabs = await chrome.tabs.query({});
  displayTabs(allTabs);
}

// Anzeigen aller Tabs mit Checkboxen
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
      checkbox.dataset.index = index;
      
      const favicon = document.createElement('img');
      favicon.src = tab.favIconUrl || 'placeholder-icon.png';
      
      const title = document.createElement('div');
      title.className = 'tab-title';
      title.textContent = tab.title;
      title.title = tab.url;
      
      tabItem.appendChild(checkbox);
      tabItem.appendChild(favicon);
      tabItem.appendChild(title);
      tabList.appendChild(tabItem);
    }
  });
}

// Generieren eines Links für ausgewählte Tabs
async function generateLink() {
  const selectedTabIndices = Array.from(document.querySelectorAll('#tabList input[type="checkbox"]:checked'))
    .map(checkbox => parseInt(checkbox.dataset.index));
  
  if (selectedTabIndices.length === 0) {
    showStatus('Bitte wähle mindestens einen Tab aus!', true);
    return;
  }

  const selectedTabs = selectedTabIndices.map(index => allTabs[index]);

  const urls = selectedTabs
    .map(tab => tab.url)
    .filter(url => url.startsWith('http'))
    .map(url => encodeURIComponent(url))
    .join(',');

  if (urls.length > 7000) {
    showStatus('Warnung: Die URL ist sehr lang und könnte in manchen Browsern Probleme verursachen. Bitte reduziere die Anzahl der Tabs.', true);
  }

  const baseUrl = 'https://smnprtn.github.io/tab-exporter/open-tabs.html?urls=';
  const fullUrl = baseUrl + urls;

  try {
    await navigator.clipboard.writeText(fullUrl);
    showStatus(`Link für ${selectedTabIndices.length} Tabs in die Zwischenablage kopiert!`);
  } catch (err) {
    showStatus('Fehler beim Kopieren des Links: ' + err.message, true);
  }
}

// Tab-Set mit Namen speichern
async function saveTabSet() {
  const setName = document.getElementById('setName').value.trim();
  if (!setName) {
    showStatus('Bitte gib einen Namen für das Tab-Set ein!', true);
    return;
  }

  const selectedTabIndices = Array.from(document.querySelectorAll('#tabList input[type="checkbox"]:checked'))
    .map(checkbox => parseInt(checkbox.dataset.index));
  
  if (selectedTabIndices.length === 0) {
    showStatus('Bitte wähle mindestens einen Tab aus!', true);
    return;
  }

  const selectedTabs = selectedTabIndices.map(index => {
    const tab = allTabs[index];
    return {
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl
    };
  });

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
        showStatus(`Tab-Set "${setName}" erfolgreich gespeichert!`);
        loadSavedSets();
      } else {
        showStatus('Fehler beim Speichern des Tab-Sets!', true);
      }
    }
  );
}

// Statusnachricht anzeigen
function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = isError ? 'error' : '';
  setTimeout(() => {
    status.textContent = '';
    status.className = '';
  }, 5000);
}

// Gespeicherte Tab-Sets laden
function loadSavedSets() {
  chrome.runtime.sendMessage({ action: 'getSavedSets' }, response => {
    const savedSetsList = document.getElementById('savedSetsList');
    savedSetsList.innerHTML = '';
    
    if (!response.sets || Object.keys(response.sets).length === 0) {
      savedSetsList.textContent = 'Keine gespeicherten Tab-Sets vorhanden.';
      return;
    }

    for (const [name, tabs] of Object.entries(response.sets)) {
      const setItem = document.createElement('div');
      setItem.className = 'tab-item';

      const setTitle = document.createElement('div');
      setTitle.className = 'tab-title';
      setTitle.textContent = name + ` (${tabs.length} Tabs)`;

      const loadButton = document.createElement('button');
      loadButton.textContent = 'Öffnen';
      loadButton.disabled = !popupPermissionGranted;

      loadButton.addEventListener('click', () => {
        const urls = tabs.map(tab => encodeURIComponent(tab.url)).join(',');
        const baseUrl = 'https://smnprtn.github.io/tab-exporter/open-tabs.html?urls=';
        const fullUrl = baseUrl + urls;
        window.open(fullUrl, '_blank');
      });

      setItem.appendChild(setTitle);
      setItem.appendChild(loadButton);
      savedSetsList.appendChild(setItem);
    }
  });
}

// Event-Listener
document.addEventListener('DOMContentLoaded', () => {
  loadTabs();
  loadSavedSets();

  document.getElementById('generate').addEventListener('click', generateLink);
  
  document.getElementById('selectAll').addEventListener('click', () => {
    document.querySelectorAll('#tabList input[type="checkbox"]').forEach(cb => cb.checked = true);
  });
  
  document.getElementById('deselectAll').addEventListener('click', () => {
    document.querySelectorAll('#tabList input[type="checkbox"]').forEach(cb => cb.checked = false);
  });

  document.getElementById('openSaveForm').addEventListener('click', () => {
    document.getElementById('saveForm').style.display = 'flex';
  });

  document.getElementById('saveSet').addEventListener('click', saveTabSet);

  // Neuer Button: Popup-Erlaubnis einholen
  document.getElementById('popupPermissionBtn').addEventListener('click', () => {
    const test = window.open("about:blank", "_blank");
    if (!test) {
      showStatus("Bitte Popups oben in der URL-Leiste zulassen!", true);
    } else {
      popupPermissionGranted = true;
      test.close();
      showStatus("Popup-Erlaubnis erteilt. Jetzt kannst du Tabs öffnen!");
      document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent === "Öffnen") {
          btn.disabled = false;
        }
      });
    }
  });
});
