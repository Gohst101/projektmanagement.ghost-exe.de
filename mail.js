const nodemailer = require("nodemailer")
require('dotenv').config()

console.log("Running Test Mails")

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: "mail.skykopf.com",
    port: 587,
    secure: false,
    auth: {
        user: "no-reply@ghost-exe.de",
        pass: "94,?,LEntIo"
    },
    tls: { // Später Daniel Fragen ob ich den Key für Trusted Mails bekommen kann.
        rejectUnauthorized: false
    }
})

test_mail()
send_mail()


// Test Mail
async function test_mail() {
    try {
        await transporter.verify();
        console.log("Server is ready to take our messages");
    } catch (err) {
        console.error("Verification failed:", err);
    }
}

// Send Mail
async function send_mail() {
    try {
        const info = await transporter.sendMail({
            from: '"Projektmanagement" <no-reply@ghost-exe.de>',
            to: "hhamjediers@gmail.com",
            subject: "Password reset",
            text: `Hey Heinke
to reset your password click the Link https://projektmanagement.ghost-exe.de/auth/password/reset?code=12cdEF and enter your new Password. This Link will be 10 Minutes valid.

If this was not triggerd by you just ignore this message.
`,
        });

        console.log("Gesendet:", info.messageId);
    } catch (err) {
        console.error(err);
    }
}