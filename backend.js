// Imports
const express = require('express')
const session = require('express-session')
const https = require('https')
const path = require('path')
const fs = require('fs')
const pem = require('pem')
const pool = require('./database/connection/connection.js')
require('dotenv').config()

// .env Variables
const PORT = Number(process.env.PORT || 25590)
const FORCE_DB = String(process.env.FORCE_DB).toLowerCase() === 'true'
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SESSION_KEY
if (!SESSION_SECRET) {
	throw new Error('SESSION_SECRET (or SESSION_KEY) must be set in the .env file.')
}
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
	throw new Error('PORT must be a valid TCP port between 1 and 65535.')
}
console.log(`[STARTUP] Starting Website on ${PORT}`)

// App Port
// Der Port auf dem die Website vom Server aus erreichbar sein wird.
const app = express()
if (process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1)
}
// parse application/json
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Express Session
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}))

// Routes
// Importieren der Routen-Module
const redirects = require('./routes/redirects')
const privateRoutes = require('./routes/private')
const publicRoutes = require('./routes/public')
const authRoutes = require('./routes/auth')
const planningApi = require('./api/internal/planning')
const dashboardApi = require('./api/internal/dashboard')
const structureplanApi = require('./api/internal/structureplan')
const { registerErrorHandlers } = require('./routes/error')

// View Engine (EJS Templates)
// EJS ist eine Template-Engine, die wir nutzen um in den HTML Dateien daten anzuzeigen.
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Static Files
// Hier werden die statischen Dateien wie CSS, JS, Bilder usw. bereitgestellt.
app.use('/css', express.static(path.join(__dirname, 'assets/css')))
app.use('/js', express.static(path.join(__dirname, 'assets/js')))
app.use('/img', express.static(path.join(__dirname, 'assets/img')))
app.use('/themes', express.static(path.join(__dirname, 'assets/themes')))
app.use('/icons', express.static(path.join(__dirname, 'assets/media/icons')))
app.use('/images', express.static(path.join(__dirname, 'assets/media/images')))
app.use('/videos', express.static(path.join(__dirname, 'assets/media/videos')))

// Routes
// Hier werden die Routen-Module in die App eingebunden, sodass die definierten Routen erreichbar sind.
app.use(redirects)
app.use(publicRoutes)
app.use(privateRoutes)
app.use(authRoutes)
app.use(planningApi)
app.use(dashboardApi)
app.use(structureplanApi)
registerErrorHandlers(app)

// Calling Start Server Function
console.log(`[Startup Process] ⏳ Starting Website..`)
startServer()

// Start Server Function
function startServer() {
	if (FORCE_DB) {
		console.log('[Startup Process] DB Check..')
		pool.verifyDatabaseConnection()
			.then(createCert)
			.catch(error => {
				console.error('[Startup Process] ❌ Database connection failed:', error)
				process.exitCode = 1
			})
	} else {
		console.log('[Startup Process] Skip DB Check')
		createCert()
	}

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