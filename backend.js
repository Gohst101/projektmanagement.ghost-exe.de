// Imports
const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')
const pem = require('pem')
require('dotenv').config()

// .env Variables
const PORT = process.env.PORT
const SESSION_SECRET = process.env.SESSION_SECRET
console.log(`GitHub URL: ${process.env.GITHUB}`)
console.log(`[STARTUP] Starting Website on ${PORT}`)

// App Port
const app = express()

// Set EJS as View Engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get("/", (req, res) => {
    res.send("Projektmanagement läuft!")
})

// Calling Start Server Function
console.log(`[Startup Process] ⏳ Starting Website..`)
startServer()

// Start Server Function
function startServer() {
	createCert()

	// SSL Certificate erstellung von Felix
	const isLocal = process.platform === 'win32'
	function createCert() {
		pem.createCertificate({ days: 365, selfSigned: true }, (err, keys) => {
			if (isLocal) {
				// Use SSL certificate from C:/SSL/ on Windows
				try {
					const key = fs.readFileSync('C:/SSL/localhost-key.pem')
					const cert = fs.readFileSync('C:/SSL/localhost.pem')
					keys = { serviceKey: key, certificate: cert }
				} catch (err) {
					console.error('[Startup Process] ❌ Error reading SSL certificate from C:/SSL/:', err)
					return
				}
			} else {
				// Use pem.createCertificate on Linux/other platforms
				if (err) {
					console.error('[Startup Process] ❌ Error creating self-signed certificate:', err)
					return
				}
			}
			https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(PORT, () => {
				console.log(`[Startup Process] ✅ Done`)
				console.log(`[Startup Process] 🌐 HTTPS Server running on port ${PORT}`)
				console.log(`[Startup Process] 🌐 URL: https://localhost:${PORT}`)
			})
		})
	}
}