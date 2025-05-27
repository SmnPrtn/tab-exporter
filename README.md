# Tab Exporter - Chrome Extension

Eine minimalistische Chrome Extension zum Exportieren und Teilen von Browser-Tabs.

## Features

- 📤 **Export aller Tabs** des aktuellen Fensters als teilbarer Link
- 🔗 **Ein-Klick-Sharing** - Link wird automatisch in die Zwischenablage kopiert
- 🎯 **Hintergrund-Öffnung** - Alle Tabs werden im Hintergrund geöffnet (nicht aktiv)
- 🎨 **Cleanes Design** - Minimalistisches, weißes Interface
- 🔒 **Sicher** - Keine externen Abhängigkeiten, keine Datensammlung

## Installation

### Aus dem Chrome Web Store
*(Noch nicht verfügbar)*

### Manuelle Installation (Entwicklermodus)

1. Repository klonen oder als ZIP herunterladen:
   ```bash
   git clone https://github.com/yourusername/tab-exporter.git
   ```

2. Chrome öffnen und zu `chrome://extensions/` navigieren

3. "Entwicklermodus" oben rechts aktivieren

4. "Entpackte Erweiterung laden" klicken

5. Den `tab-exporter` Ordner auswählen

## Verwendung

1. Klicken Sie auf das Tab Exporter Icon in der Chrome-Toolbar
2. Die Anzahl der Tabs im aktuellen Fenster wird angezeigt
3. Klicken Sie auf "Link erstellen"
4. Der Link wird automatisch kopiert und kann geteilt werden
5. Beim Öffnen des Links werden alle Tabs im Hintergrund geöffnet

## Technische Details

### Unterstützte URLs
- ✅ `http://` und `https://` URLs
- ❌ Chrome-interne Seiten (`chrome://`, `chrome-extension://`)
- ❌ Lokale Dateien (`file://`)
- ❌ Data-URLs (`data:`)

### Sicherheit
- Die Extension benötigt nur die `tabs` Berechtigung
- Keine externen Server-Verbindungen
- Alle Daten werden lokal verarbeitet
- Links werden als Base64-kodierte JSON-Daten übertragen

### Limitierungen
- Maximale URL-Länge: ~8000 Zeichen
- Nur das aktive Fenster wird exportiert
- Chrome-interne Seiten können nicht exportiert werden

## Entwicklung

### Voraussetzungen
- Chrome Browser (Version 88+)
- Grundkenntnisse in JavaScript/HTML/CSS

### Projektstruktur
```
tab-exporter/
├── manifest.json      # Extension-Konfiguration
├── popup.html        # Popup-Interface
├── popup.css         # Styling
├── popup.js          # Popup-Logik
├── background.js     # Service Worker
├── icons/            # Extension Icons
└── README.md         # Dokumentation
```

### Icons erstellen
Die Extension benötigt Icons in drei Größen:
- 16x16px (Toolbar)
- 48x48px (Extensions-Seite)
- 128x128px (Chrome Web Store)

Empfohlenes Design: Weißer Hintergrund mit schwarzem Link-Symbol

## Fehlerbehebung

### "Keine Tabs zum Exportieren gefunden"
- Stellen Sie sicher, dass mindestens ein Tab geöffnet ist
- Chrome-interne Seiten werden automatisch gefiltert

### "Der Link ist zu lang"
- Reduzieren Sie die Anzahl der Tabs
- Schließen Sie Tabs mit sehr langen URLs

### Tabs öffnen sich nicht
- Prüfen Sie, ob Popups in Chrome blockiert sind
- Stellen Sie sicher, dass die Extension korrekt installiert ist

## Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei

## Beitragen

Pull Requests sind willkommen! Für größere Änderungen öffnen Sie bitte zuerst ein Issue.

## Support

Bei Fragen oder Problemen öffnen Sie bitte ein [Issue](https://github.com/yourusername/tab-exporter/issues).

---

Made with ❤️ for a cleaner browsing experience# tab-exporter
