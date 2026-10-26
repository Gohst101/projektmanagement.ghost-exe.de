const createTransporter = require("./connection/connection.js")

// Send Verification Mail
async function sendVerificationMail(email, username, code, baseURL) {
    const transporter = await createTransporter()
    if (!baseURL) {
        throw new Error('BASE_URL is not configured.')
    }

    const verificationUrl = new URL('/api/auth/email/verify', baseURL)
    verificationUrl.searchParams.set('code', code)
    const mail = await transporter.sendMail({
        from: '"Projektmanagement" <no-reply@ghost-exe.de>',
        to: email,
        subject: 'E-Mail bestätigen',
        text: `Hallo ${username},\nbitte bestätige deine E-Mail-Adresse mit diesem Link:\n${verificationUrl.toString()}`
    })
    console.log('[MAIL] Verification email sent:', mail.messageId)
}

async function sendPasswordResetMail(email, username, code, baseURL) {
    const transporter = await createTransporter()
    if (!baseURL) {
        throw new Error('BASE_URL is not configured.')
    }

    const resetUrl = new URL('/auth/password-reset', baseURL)
    resetUrl.searchParams.set('code', code)
    const mail = await transporter.sendMail({
        from: '"Projektmanagement" <no-reply@ghost-exe.de>',
        to: email,
        subject: 'Passwort zurücksetzen',
        text: `Hallo ${username},\nüber diesen Link kannst du innerhalb einer Stunde ein neues Passwort festlegen:\n${resetUrl.toString()}\n\nWenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.`
    })
    console.log('[MAIL] Password reset email sent:', mail.messageId)
}

module.exports = {
    sendVerificationMail,
    sendPasswordResetMail
}