const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/requireAuth.js')
const pool = require('../database/connection/connection.js')

// Dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
    console.log(req.session)

    // Get Projects
    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ?", [req.session.user.userId])    
    projects.forEach(project => {
        project.tasks = JSON.parse(project.tasks).tasks
    })

    console.log("Project Data:", JSON.stringify(projects, null, 2))

    res.render("private/dashboard", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects: projects,
        currentPage: 'dashboard'
    })
})

// Vorplan
router.get('/planning/:id', requireAuth, async (req, res) => {
    console.log(req.session)
    const projectId = req.params.id

    // Get specefic Project data
    const [project] = await pool.query("SELECT * FROM projects WHERE userId = ? AND id = ?", [req.session.user.userId, projectId])
    project.forEach(project => {
        project.tasks = JSON.parse(project.tasks).tasks
    })

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/planning", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        currentPage: 'planning'
    })
})

// Struckturplan
router.get('/structureplan/:id', requireAuth, async (req, res) => {
    console.log(req.session)
    const projectId = req.params.id

    // Get specefic Project data
    const [project] = await pool.query("SELECT * FROM projects WHERE userId = ? AND id = ?", [req.session.user.userId, projectId])
    project.forEach(project => {
        project.tasks = JSON.parse(project.tasks).tasks
    })

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/structureplan", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        currentPage: 'structureplan'
    })
})

// Balkendiagramm
router.get('/bar_chart/:id', requireAuth, async (req, res) => {
    console.log(req.session)
    const projectId = req.params.id

    // Get specefic Project data
    const [project] = await pool.query("SELECT * FROM projects WHERE userId = ? AND id = ?", [req.session.user.userId, projectId])
    project.forEach(project => {
        project.tasks = JSON.parse(project.tasks).tasks
    })

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/bar_chart", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        currentPage: 'bar_chart'
    })
})

// Kostendiagramm
router.get('/cost_chart/:id', requireAuth, async (req, res) => {
    console.log(req.session)
    const projectId = req.params.id

    // Get specefic Project data
    const [project] = await pool.query("SELECT * FROM projects WHERE userId = ? AND id = ?", [req.session.user.userId, projectId])
    project.forEach(project => {
        project.tasks = JSON.parse(project.tasks).tasks
    })

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/cost_chart", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        currentPage: 'cost_chart'
    })
})

// Netzplan
router.get('/network_plan/:id', requireAuth, async (req, res) => {
    console.log(req.session)
    const projectId = req.params.id

    // Get specefic Project data
    const [project] = await pool.query("SELECT * FROM projects WHERE userId = ? AND id = ?", [req.session.user.userId, projectId])
    project.forEach(project => {
        project.tasks = JSON.parse(project.tasks).tasks
    })

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/network_plan", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        currentPage: 'network_plan'
    })
})

module.exports = router