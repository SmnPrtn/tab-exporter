// Global variables
let allTabs = [];

// Function to load all open tabs
async function loadTabs() {
  allTabs = await chrome.tabs.query({});
  displayTabs(allTabs);
}

// Display all tabs with checkboxes
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
      favicon.onerror = () => {
        favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
      }
      
      const title = document.createElement('div');
      title.className = 'tab-title';
      title.textContent = tab.title;
      title.title = tab.url; // Tooltip with full URL
      
      tabItem.appendChild(checkbox);
      tabItem.appendChild(favicon);
      tabItem.appendChild(title);
      tabList.appendChild(tabItem);
    }
  });
}

// Generate a link for selected tabs
async function generateLink() {
  const selectedTabIndices = Array.from(document.querySelectorAll('#tabList input[type="checkbox"]:checked'))
    .map(checkbox => parseInt(checkbox.dataset.index));
  
  if (selectedTabIndices.length === 0) {
    showStatus('Please select at least one tab!', true);
    return;
  }
  
  const selectedTabs = selectedTabIndices.map(index => allTabs[index]);
  
  // Prepare URLs for the link
  const urls = selectedTabs
    .map(tab => tab.url)
    .filter(url => url.startsWith('http'))
    .map(url => encodeURIComponent(url))
    .join(',');
  
  // Check URL length
  if (urls.length > 7000) {
    showStatus('Warning: The URL is very long and might cause issues in some browsers. Please reduce the number of tabs.', true);
  }
  
  const baseUrl = 'https://smnprtn.github.io/tab-exporter/open-tabs.html?urls=';
  const fullUrl = baseUrl + urls;
  
  try {
    await navigator.clipboard.writeText(fullUrl);
    showStatus(`Link for ${selectedTabIndices.length} tabs copied to clipboard!`);
  } catch (err) {
    showStatus('Error copying link: ' + err.message, true);
  }
}

// Save tab set with name
async function saveTabSet() {
  const setName = document.getElementById('setName').value.trim();
  if (!setName) {
    showStatus('Please enter a name for the tab set!', true);
    return;
  }
  
  const selectedTabIndices = Array.from(document.querySelectorAll('#tabList input[type="checkbox"]:checked'))
    .map(checkbox => parseInt(checkbox.dataset.index));
  
  if (selectedTabIndices.length === 0) {
    showStatus('Please select at least one tab!', true);
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
  
  // Send to background script for saving
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
        showStatus(`Tab set "${setName}" successfully saved!`);
        loadSavedSets();
      } else {
        showStatus('Error saving tab set!', true);
      }
    }
  );
}

// Show status message
function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  
  if (isError) {
    status.className = 'error';
  } else {
    status.className = '';
  }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    status.textContent = '';
    status.className = '';
  }, 5000);
}

// Delete a saved tab set
function deleteTabSet(setName) {
  chrome.runtime.sendMessage(
    { 
      action: 'deleteTabSet', 
      setName: setName 
    },
    response => {
      if (response && response.success) {
        showStatus(`Tab set "${setName}" deleted!`);
        loadSavedSets();
      } else {
        showStatus('Error deleting tab set!', true);
      }
    }
  );
}

// Load and display saved tab sets
function loadSavedSets() {
  chrome.runtime.sendMessage({ action: 'getSavedSets' }, response => {
    const savedSetsList = document.getElementById('savedSetsList');
    savedSetsList.innerHTML = '';
    
    if (!response.sets || Object.keys(response.sets).length === 0) {
      savedSetsList.textContent = 'No saved tab sets available.';
      return;
    }
    
    for (const [name, tabs] of Object.entries(response.sets)) {
      const setItem = document.createElement('div');
      setItem.className = 'set-item';
      
      const setTitle = document.createElement('div');
      setTitle.className = 'tab-title';
      setTitle.textContent = name + ` (${tabs.length} tabs)`;
      
      const setActions = document.createElement('div');
      setActions.className = 'set-actions';
      
      const loadButton = document.createElement('button');
      loadButton.textContent = 'Copy Link';
      loadButton.addEventListener('click', () => {
        const urls = tabs.map(tab => encodeURIComponent(tab.url)).join(',');
        const baseUrl = 'https://smnprtn.github.io/tab-exporter/open-tabs.html?urls=';
        const fullUrl = baseUrl + urls;
        navigator.clipboard.writeText(fullUrl);
        showStatus(`Link for set "${name}" copied to clipboard!`);
      });
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';
      deleteButton.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete the tab set "${name}"?`)) {
          deleteTabSet(name);
        }
      });
      
      setActions.appendChild(loadButton);
      setActions.appendChild(deleteButton);
      
      setItem.appendChild(setTitle);
      setItem.appendChild(setActions);
      savedSetsList.appendChild(setItem);
    }
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load tabs
  loadTabs();
  
  // Get saved sets
  loadSavedSets();
  
  // Add event listeners
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
