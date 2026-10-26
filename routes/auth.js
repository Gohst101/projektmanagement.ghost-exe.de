const express = require('express')
const crypto = require('crypto')
const pool = require('../database/connection/connection.js')
const { sendVerificationMail, sendPasswordResetMail } = require('../mail/mails.js')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const router = express.Router()

function renderRegister(res, message = null, error = null, status = 200) {
    return res.status(status).render('public/register', { message, error })
}

function renderLogin(res, error = null, status = 200, message = null) {
    return res.status(status).render('public/login', { message, error })
}

router.get('/forgot-password', (req, res) => {
    res.render('public/forgot_password', { message: null, error: null })
})

router.post('/auth/verification/resend', async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return renderRegister(res, null, 'Bitte gib eine gültige E-Mail-Adresse ein.', 400)
    }

    try {
        const [users] = await pool.query(
            'SELECT id, username, email_verified FROM users WHERE email = ?',
            [email]
        )
        if (users.length > 0 && !users[0].email_verified) {
            const code = crypto.randomBytes(32).toString('hex')
            await pool.query('DELETE FROM email_verification WHERE userId = ?', [users[0].id])
            await pool.query(
                'INSERT INTO email_verification (userId, code) VALUES (?, ?)',
                [users[0].id, code]
            )
            await sendVerificationMail(email, users[0].username, code, process.env.BASE_URL)
        }

        return renderRegister(res, 'Wenn ein unbestätigtes Konto zu dieser Adresse existiert, wurde eine neue Bestätigungs-E-Mail versendet.')
    } catch (error) {
        console.error('Verification email could not be resent:', error)
        return renderRegister(res, null, 'Die E-Mail konnte momentan nicht versendet werden.', 503)
    }
})

// Return a generic response regardless of account existence to avoid exposing registered addresses.
router.post('/auth/password-reset/request', async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).render('public/forgot_password', {
            message: null,
            error: 'Bitte gib eine gültige E-Mail-Adresse ein.'
        })
    }

    try {
        const [users] = await pool.query(
            'SELECT id, username FROM users WHERE email = ?',
            [email]
        )
        if (users.length > 0) {
            const code = crypto.randomBytes(32).toString('hex')
            await pool.query('DELETE FROM password_resets WHERE userId = ?', [users[0].id])
            await pool.query(
                'INSERT INTO password_resets (userId, code) VALUES (?, ?)',
                [users[0].id, code]
            )
            await sendPasswordResetMail(email, users[0].username, code, process.env.BASE_URL)
        }

        return res.render('public/forgot_password', {
            message: 'Wenn ein Konto zu dieser Adresse existiert, wurde ein Link zum Zurücksetzen versendet.',
            error: null
        })
    } catch (error) {
        console.error('Password reset request failed:', error)
        return res.status(503).render('public/forgot_password', {
            message: null,
            error: 'Die Anfrage konnte nicht bearbeitet werden. Bitte versuche es später erneut.'
        })
    }
})

router.get('/auth/password-reset', async (req, res) => {
    const code = typeof req.query.code === 'string' ? req.query.code : ''
    if (!/^[a-f0-9]{64}$/.test(code)) {
        return res.status(400).render('public/reset_password', {
            code: '',
            error: 'Der Link ist ungültig oder abgelaufen.'
        })
    }

    try {
        const [resetRequests] = await pool.query(
            'SELECT id FROM password_resets WHERE code = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)',
            [code]
        )
        if (resetRequests.length === 0) {
            return res.status(400).render('public/reset_password', {
                code: '',
                error: 'Der Link ist ungültig oder abgelaufen.'
            })
        }
        return res.render('public/reset_password', { code, error: null })
    } catch (error) {
        console.error('Password reset link could not be checked:', error)
        return res.status(503).render('public/reset_password', {
            code: '',
            error: 'Der Link konnte momentan nicht geprüft werden.'
        })
    }
})

router.post('/auth/password-reset', async (req, res) => {
    const code = typeof req.body.code === 'string' ? req.body.code : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''
    const confirmation = typeof req.body.password_confirm === 'string' ? req.body.password_confirm : ''
    if (!/^[a-f0-9]{64}$/.test(code)) {
        return res.status(400).render('public/reset_password', {
            code: '',
            error: 'Der Link ist ungültig oder abgelaufen.'
        })
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        return res.status(400).render('public/reset_password', {
            code,
            error: 'Das Passwort muss mindestens 8 Zeichen lang sein.'
        })
    }
    if (password !== confirmation) {
        return res.status(400).render('public/reset_password', {
            code,
            error: 'Die Passwörter stimmen nicht überein.'
        })
    }

    let connection
    try {
        connection = await pool.getConnection()
        await connection.beginTransaction()
        const [resetRequests] = await connection.query(
            'SELECT userId FROM password_resets WHERE code = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)',
            [code]
        )
        if (resetRequests.length === 0) {
            await connection.rollback()
            return res.status(400).render('public/reset_password', {
                code: '',
                error: 'Der Link ist ungültig oder abgelaufen.'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await connection.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, resetRequests[0].userId]
        )
        await connection.query('DELETE FROM password_resets WHERE userId = ?', [resetRequests[0].userId])
        await connection.commit()
        return renderLogin(res, null, 200, 'Dein Passwort wurde geändert. Du kannst dich jetzt anmelden.')
    } catch (error) {
        if (connection) await connection.rollback()
        console.error('Password could not be reset:', error)
        return res.status(503).render('public/reset_password', {
            code,
            error: 'Das Passwort konnte momentan nicht geändert werden.'
        })
    } finally {
        connection?.release()
    }
})

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
    let userId
    const code = crypto.randomBytes(32).toString('hex')

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
        const [result] = await connection.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        )
        userId = result.insertId
        await connection.query(
            'INSERT INTO email_verification (userId, code) VALUES (?, ?)',
            [userId, code]
        )
        await connection.commit()
    } catch (error) {
        if (connection) await connection.rollback()
        console.error('Registration could not be stored:', error)
        return renderRegister(res, null, 'Die Registrierung ist fehlgeschlagen. Bitte versuche es erneut.', 500)
    } finally {
        connection?.release()
    }

    try {
        await sendVerificationMail(email, username, code, process.env.BASE_URL)
        return renderRegister(res, 'Wir haben dir eine E-Mail zur Bestätigung gesendet.')
    } catch (error) {
        console.error('Registration verification email could not be sent:', error)
        return renderRegister(
            res,
            null,
            'Dein Konto wurde angelegt, aber die Bestätigungs-E-Mail konnte nicht versendet werden. Bitte kontaktiere den Support.',
            503
        )
    }
})

// Activate a newly registered account only after its one-time verification code is confirmed.
router.get('/api/auth/email/verify', async (req, res) => {
    const code = typeof req.query.code === 'string' ? req.query.code : ''
    if (!/^[a-f0-9]{64}$/.test(code)) {
        return renderRegister(res, null, 'Der Bestätigungslink ist ungültig oder abgelaufen.', 400)
    }

    let connection
    try {
        connection = await pool.getConnection()
        await connection.beginTransaction()
        const [verification] = await connection.query(
            'SELECT userId FROM email_verification WHERE code = ?',
            [code]
        )
        if (verification.length === 0) {
            await connection.rollback()
            return renderRegister(res, null, 'Der Bestätigungslink ist ungültig oder wurde bereits verwendet.', 400)
        }

        await connection.query('UPDATE users SET email_verified = 1 WHERE id = ?', [verification[0].userId])
        await connection.query('DELETE FROM email_verification WHERE code = ?', [code])
        await connection.commit()
        return renderLogin(res, null, 200, 'Deine E-Mail-Adresse wurde bestätigt. Du kannst dich jetzt anmelden.')
    } catch (error) {
        if (connection) await connection.rollback()
        console.error('Email verification failed:', error)
        return renderRegister(res, null, 'Die E-Mail-Adresse konnte nicht bestätigt werden.', 500)
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
            'SELECT id, email, password, username, email_verified FROM users WHERE email = ?',
            [email]
        )
        const user = users[0]
        const passwordMatches = user ? await bcrypt.compare(password, user.password) : false

        if (!user || !passwordMatches) {
            return renderLogin(res, 'Falscher Login.', 401)
        }
        if (!user.email_verified) {
            return renderLogin(res, 'Bitte bestätige zuerst deine E-Mail-Adresse.')
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
