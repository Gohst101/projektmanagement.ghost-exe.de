function registerErrorHandlers(app) {
	// 404 - Error Handler
	app.use((req, res) => {
        console.error('[ERROR HANDLER] Page not found:')
		res.status(404).render('error/404', {
			requestedPath: req.path,
			user: req.user || null
		})
	})

	// 503 - Error Handler
	app.use((err, req, res, next) => {
		if (res.headersSent) {
			return next(err)
		}

		console.error('[ERROR HANDLER] 🚨 Server Error:', err && err.message)
		res.status(503).render('error/503', {
			requestedPath: req.path,
			user: req.user || null
		})
	})
}

module.exports = { registerErrorHandlers }