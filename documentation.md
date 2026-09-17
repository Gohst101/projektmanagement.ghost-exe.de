API Routes:

Register:
/auth/register

Login:
/auth/login



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