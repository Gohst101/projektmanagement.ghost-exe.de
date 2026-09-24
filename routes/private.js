const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/requireAuth.js')
const pool = require('../database/connection/connection.js')

// Dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
    console.log(req.session)

    // Get Projects
    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ?", [req.session.user.userId])
    console.log(projects)

    res.render("private/dashboard", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects: projects,
        currentPage: 'dashboard'
    })
})

// Vorplan
router.get('/planning', requireAuth, async (req, res) => {
    console.log(req.session)

    // Get Projects
    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ?", [req.session.user.userId])
    console.log(projects)

    res.render("private/planning", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects: projects,
        currentPage: 'planning'
    })
})

// Struckturplan
router.get('/structureplan', requireAuth, async (req, res) => {
    console.log(req.session)

    // Get Projects
    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ?", [req.session.user.userId])
    console.log(projects)

    res.render("private/structureplan", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects: projects,
        currentPage: 'structureplan'
    })
})

// Balkendiagramm
router.get('/bar_chart', requireAuth, async (req, res) => {
    console.log(req.session)

    // Get Projects
    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ?", [req.session.user.userId])
    console.log(projects)

    res.render("private/bar_chart", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects: projects,
        currentPage: 'bar_chart'
    })
})

// Kostendiagramm
router.get('/cost_chart', requireAuth, async (req, res) => {
    console.log(req.session)

    // Get Projects
    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ?", [req.session.user.userId])
    console.log(projects)

    res.render("private/cost_chart", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects: projects,
        currentPage: 'cost_chart'
    })
})

// Netzplan
router.get('/network_plan', requireAuth, async (req, res) => {
    console.log(req.session)

    // Get Projects
    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ?", [req.session.user.userId])
    console.log(projects)

    res.render("private/network_plan", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects: projects,
        currentPage: 'network_plan'
    })
})

module.exports = router