const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/requireAuth.js')
const pool = require('../database/connection/connection.js')

// Dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
    console.log(req.session);

    res.render("private/dashboard", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        activePage: 'dashboard'
    });
})


module.exports = router