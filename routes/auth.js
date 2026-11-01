const express = require('express')
const pool = require('../database/connection/connection.js')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const router = express.Router()

function renderRegister(res, message = null, error = null, status = 200) {
    return res.status(status).render('public/register', { message, error })
}

function renderLogin(res, error = null, status = 200, message = null) {
    return res.status(status).render('public/login', { message, error })
}

// Validate and persist registration data using parameters rather than SQL interpolation.
router.post('/auth/register', async (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : ''
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''
    const passwordConfirm = typeof req.body.password_confirm === 'string' ? req.body.password_confirm : ''

    if (username.length < 2 || username.length > 40 || email.length > 254
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        return renderRegister(res, null, 'Bitte prüfe Benutzername, E-Mail und Passwort (mindestens 8 Zeichen).', 400)
    }
    if (password !== passwordConfirm) {
        return renderRegister(res, null, 'Die Passwörter stimmen nicht überein.', 400)
    }

    let connection
    try {
        connection = await pool.getConnection()
        await connection.beginTransaction()
        const [existingUsers] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        )
        if (existingUsers.length > 0) {
            await connection.rollback()
            return renderRegister(res, null, 'Diese E-Mail-Adresse ist bereits registriert.', 409)
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await connection.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        )
        await connection.commit()
        return renderLogin(res, null, 200, 'Dein Konto wurde erstellt. Du kannst dich jetzt anmelden.')
    } catch (error) {
        if (connection) await connection.rollback()
        console.error('Registration could not be stored:', error)
        return renderRegister(res, null, 'Die Registrierung ist fehlgeschlagen. Bitte versuche es erneut.', 500)
    } finally {
        connection?.release()
    }
})

router.post('/auth/login', async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!email || !password) {
        return renderLogin(res, 'Falscher Login.', 400)
    }

    try {
        const [users] = await pool.query(
            'SELECT id, email, password, username FROM users WHERE email = ?',
            [email]
        )
        const user = users[0]
        const passwordMatches = user ? await bcrypt.compare(password, user.password) : false

        if (!user || !passwordMatches) {
            return renderLogin(res, 'Falscher Login.', 401)
        }

        await new Promise((resolve, reject) => {
            req.session.regenerate(error => error ? reject(error) : resolve())
        })
        req.session.user = {
            userId: user.id,
            email: user.email,
            username: user.username
        }
        req.session.cookie.maxAge = req.body.remember_me
            ? 7 * 24 * 60 * 60 * 1000
            : null

        return res.redirect('/dashboard')
    } catch (error) {
        console.error('Login failed:', error)
        return renderLogin(res, 'Die Anmeldung ist momentan nicht möglich.', 503)
    }
})

router.get('/auth/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.error('Session could not be destroyed:', error)
            return res.status(500).render('error/503')
        }
        res.clearCookie('connect.sid')
        return res.redirect('/login')
    })
})

module.exports = router