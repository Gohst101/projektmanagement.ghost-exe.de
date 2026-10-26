require('dotenv').config()
const nodemailer = require("nodemailer")

async function createTransporter() {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT || 587),
        secure: String(process.env.MAIL_SECURE).toLowerCase() === 'true',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    return transporter
}

module.exports = createTransporter