# Projektmanagement

Eine Webanwendung zur Planung von Projekten mit Vorgängen, Projektstrukturplan, Zeitplan, Netzplan und Kostenübersicht.

## Voraussetzungen

- Node.js 20 oder neuer
- MySQL 8 oder kompatibel
- Ein SMTP-Konto zum Versenden der E-Mail-Bestätigung
- Für den lokalen HTTPS-Start unter Windows: Zertifikatdateien unter `C:\SSL\localhost-key.pem` und `C:\SSL\localhost.pem`

## Installation

1. Repository klonen und in den Projektordner wechseln:

   ```powershell
   git clone https://github.com/Gohst101/projektmanagment.ghost-exe.de
   cd projektmanagment.ghost-exe.de
   ```

2. Abhängigkeiten installieren:

   ```powershell
   npm install
   ```

3. `.env_example` nach `.env` kopieren und Datenbank-, Sitzungs-, Mail- und Basis-URL-Werte eintragen. `SESSION_SECRET` muss ein zufälliger geheimer Wert sein; erzeugen kannst du ihn zum Beispiel mit:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. Eine MySQL-Datenbank anlegen und die Tabellen aus [`database/schema.sql`](./database/schema.sql) in dieser Datenbank ausführen.

5. Unter Windows die lokalen HTTPS-Zertifikate erzeugen und unter `C:\SSL` ablegen. Für andere Plattformen erzeugt das Projekt beim Start ein selbstsigniertes Zertifikat.

6. Anwendung starten und im Browser öffnen:

   ```powershell
   npm run dev
   ```

   Die lokale Adresse wird beim Start ausgegeben (standardmäßig `https://localhost:25590`). Beim selbstsignierten lokalen Zertifikat muss der Browser die Sicherheitsausnahme einmal bestätigen.

## Funktionen

- Benutzerregistrierung mit E-Mail-Bestätigung, Anmeldung und Passwort-Zurücksetzung
- Projekte erstellen, bearbeiten und löschen
- Vorgänge und Vorgänger in der Vorplanung bearbeiten und automatisch speichern
- Projektstrukturplan mit Kategorien und Unterkategorien
- Balkenplan und Netzplan mit berechneten Abhängigkeiten und kritischem Pfad
- Personalkosten: Mitarbeitende × Tage × Tagessatz pro Person und Tag

## Tests

```powershell
npm test
```
