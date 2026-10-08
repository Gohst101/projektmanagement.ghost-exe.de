ToDo:
Dashboard
- Erstellen von Projekten => Name*
- Löschen / Löschen Bestätigen um Projekt zu entfernen
- Internal API für die oberen Punkte


Vorplanung
- Vorplanung CSS überprüfen
- HTML und Felder für Form aufbereiten
- JavaScript zur erstellung neuer und entfernen der HTML Boxen
- Speicher Internal API


API Routes:

Register:
/auth/register

Login:
/auth/login

Internal Save:
/api/planning/save



Database:
- users
-- id
-- username
-- email
-- password
-- email_verified (BOOLEN)
-- created_at
-- updated_at

- password_resets
-- id
-- userId
-- code
-- created_at

- email_verification
-- id
-- userId
-- code
-- created_at

- projects
-- id
-- userId
-- title
-- description
-- tasks (JSON)
-- created_at
-- updated_at



Tasks JSON:
{
    "tasks": [
        {
            "name": "Kachel 1",
            "position": "1",
            "days": 2,
            "predecessor": []
        },
        {
            "name": "Kachel 2",
            "position": "2",
            "days": 3,
            "predecessor": ["1"]
        },
        {
            "name": "Kachel 3",
            "position": "3",
            "days": 1,
            "predecessor": ["1", "2"]
        }
    ]
}