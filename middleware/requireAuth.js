// Auth Middleware
function requireAuth(req, res, next) {
    if (!req.session?.user) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Bitte melde dich erneut an.' })
        }
        return res.redirect("/login")
    }
    next()
}

module.exports = { requireAuth }