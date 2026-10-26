# Projektdaten

Die MySQL-Tabellen und Fremdschlüssel sind in `database/schema.sql` definiert.

## Projektstruktur

Projekte speichern Vorgänge und Strukturplan gemeinsam in der JSON-Spalte `projects.tasks`, damit beide Bearbeitungsseiten unabhängig voneinander speichern können:

```json
{
  "tasks": [
    {
      "position": 1,
      "name": "Planung",
      "days": 2,
      "workers": 2,
      "salary": 25,
      "predecessor": []
    }
  ],
  "categories": [
    {
      "title": "Vorbereitung",
      "subcategories": [
        { "title": "Material" }
      ]
    }
  ]
}
```

`salary` ist der Tagessatz in Euro pro Person. Die Kostenseite berechnet die Kosten je Vorgang als `workers × days × salary`.

## Endpunkte

- `POST /auth/register` und `GET /api/auth/email/verify` – Registrierung und E-Mail-Bestätigung
- `POST /auth/verification/resend` – Bestätigungs-E-Mail erneut versenden
- `POST /auth/password-reset/request` und `POST /auth/password-reset` – zeitlich begrenzten Passwort-Reset anfordern und anwenden
- `POST /api/project/create` – Projekt erstellen
- `POST /api/project/update` – Projekttitel und Beschreibung ändern
- `POST /api/project/delete` – eigenes Projekt löschen
- `POST /api/planning/save` – Vorgänge und Abhängigkeiten speichern
- `POST /api/structureplan/save` – Kategorien und Unterkategorien speichern

Alle Projekt-Endpunkte erfordern eine angemeldete Sitzung und prüfen den Besitz des Projekts.
