const express = require('express')
const app = express()
require('dotenv').config()
const bcrypt = require("bcryptjs")

// Register
app.post("/auth/register", async (req, res) => {
    const { username, email, password, password_confirm } = req.body // Hollt daten aus dem body

    // Schau ob Passwort und Passwort bestätigen gleich ist
    if (password !== password_confirm) {
        console.log("[AUTH] ⚠️ Password does not match.")
        res.render('public/register', {
            error: "Die Passwörter stimmen nicht überein."
        })
        return
    }

    // Schau ob Email schon in der Datenbank vorhanden ist
    const [data] = await pool.query("SELECT email FROM users WHERE email = ?", [email])
    console.log(data)
    if( data.length > 0 ) {
        console.log("[AUTH] ⚠️ Email is already in use.")
        console.log(data)
        res.render('public/register', {
            error: "Email ist schon vergeben."
        })
        return
    }

    // Verschlüssel das Passwort
    let hashedPassword = await bcrypt.hash(password, 8)

    // Trage Daten in die Datenbank ein
    // https://www.w3schools.com/sql/sql_insert.asp#:~:text=INSERT%20INTO%20Customers%20%28CustomerName%2C%20City%2C%20Country%29%20VALUES%20%28%27Cardinal%27%2C%20%27Stavanger%27%2C%20%27Norway%27%29%3B
    try {
        pool.query(`INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}')`)
        res.render('public/login', {
            message: "Erfolgreich angemeldet",
            error: null
        })
    } catch(error) {
        console.log(error)
        return
    }
})

// Login
app.post("/auth/login", async (req, res) => {
    const { email, password, remember_me } = req.body // Hollt daten aus dem body

    // Gibt es die Email überhaupt?
    try {
        const [data] = await pool.query("SELECT email FROM users WHERE email = ?", [email]) // Datenbankabfrage
        if( data.length === 0 ) { // Wenn null dann gibt es diese email nicht (keine daten)
            res.render('public/login', { // Rendere die Login Page
                error: "Falscher Login" // Gebe der Login page die Variable error mit folgendem Wert mit (Wir sagen nur Falscher Login da wir nicht sagen wollen ob es die email oder das passwort war was falsch war)
            })
        }
    } catch(error) {
        res.render('public/login', {
            error: "Failed"
        })
        console.log("[ERROR] ❌ Failed at some point durring checking of email is in datebase: " + error)
    }

    // Holle nun die Daten des Nutzers aus der Datenbank da die email existiert
    try {
        const [data] = await pool.query("SELECT id, email, password, username FROM users WHERE email = ?", [email])

        // Überprüfe ob beide passwörter matchen
        // https://www.npmjs.com/package/bcrypt
        const isMatch = await bcrypt.compare(
            password,
            data[0].password
        )
        if (isMatch) { // Wenn das Passwort stimmt
            req.session.user = { // Erstelle eine Session mit der email des Nutzers
                userId: data[0].id,
                email: data[0].email,
                username: data[0].username
            }

            // Überprüfe den Remember me Button
            if (remember_me) { // Wenn remember me Button angekekreuzt wurde
                req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000 // Session geht eine Woche
            } else {
                req.session.cookie.expires = false // Session geht so lange wie bis es geschlossen wird
                req.session.cookie.maxAge = null
            }
            return res.redirect("/dashboard") // Weiterleitung zum Dashboard
        } else {
            res.render('public/login', { // Rendere die Login Page
                error: "Falscher Login" // Gebe der Login page die Variable error mit folgendem Wert mit
            })
        }
    } catch(error) {
        console.log("[ERROR] ❌ Failed somewhere getting Data out of Database: " + error)
    }
})

// Logout
app.get("/auth/logout", (req, res) => {
    req.session.destroy(() => { // Zerstört die Session des Nutzers
        res.redirect("/login") // Weiterleitung auf die Login Seite
    })
})

module.exports = app