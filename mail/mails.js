const createTransporter = require("./connection/connection.js")

// Send Verification Mail
async function sendVerificationMail(email, username, code, baseURL) {
    const transporter = await createTransporter()

    console.log(email)
    console.log(username)
    console.log(code)
    console.log(baseURL)

    try {
        const mail = await transporter.sendMail({
            from: '"Projektmanagement" <no-reply@ghost-exe.de>',
            to: `${email}`,
            subject: "E-Mail Verifizierung",
            text: `Hey ${username},\nbitte bestätige deine E-Mail durch das Klicken des Knopfes.\n\nSollte dies nicht gehen öffnen sie diesen Link: ` + `${baseURL}` + `/api/auth/email/verify?code=` + `${code}`
        })
        console.log("[MAIL] ✅ Verification Mail send. ID: ", mail.messageId)
    } catch(error) {
        console.log("[ERROR] ❌ Failed to send Mail: " + error)
    }
}

module.exports = {
    sendVerificationMail
}