# Tab Exporter

Eine Chrome-Erweiterung zum Exportieren und Teilen von offenen Browser-Tabs als wiederverwendbare Links.

## Funktionen

- **Export von Tabs:** Erstelle einen Link, der alle ausgewählten Tabs enthält
- **Selektive Auswahl:** Wähle aus, welche Tabs du exportieren möchtest
- **Tab-Sets:** Speichere deine Tab-Sammlungen unter einem Namen zur späteren Verwendung
- **Benutzerfreundlich:** Einfache Benutzeroberfläche mit visueller Darstellung der Tabs
- **Fortschrittsanzeige:** Sichtbarer Fortschritt beim Öffnen vieler Tabs

## Installation

1. Lade das Repository herunter
2. Öffne in Chrome: `chrome://extensions/`
3. Aktiviere den "Entwicklermodus" (oben rechts)
4. Klicke auf "Entpackte Erweiterung laden"
5. Wähle den Ordner mit den Erweiterungsdateien aus

## Verwendung

1. Klicke auf das Tab Exporter-Symbol in der Chrome-Toolbar
2. Wähle die Tabs aus, die du exportieren möchtest
3. Klicke auf "Link generieren"
4. Der Link wird in die Zwischenablage kopiert
5. Teile den Link mit anderen oder speichere ihn für später

## Tab-Sets speichern

1. Wähle die Tabs aus, die du als Set speichern möchtest
2. Klicke auf "Als Set speichern"
3. Gib einen Namen für das Set ein
4. Das Set wird lokal gespeichert und kann jederzeit wiederverwendet werden

## Technische Details

Die Erweiterung verwendet:
- Chrome Extension Manifest V3
- Chrome Tabs API zum Abrufen offener Tabs
- Local Storage zum Speichern von Tab-Sets
- Clipboard API zum Kopieren von Links

## Datenschutz

Tab Exporter speichert alle Daten lokal auf deinem Gerät. Es werden keine Daten an externe Server gesendet. Die generierten Links enthalten nur die URLs der Tabs, keine persönlichen Daten.

## Lizenz

[MIT](LICENSE)
