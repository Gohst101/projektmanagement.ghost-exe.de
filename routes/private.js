const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/requireAuth.js')
const { parseProjectTasks } = require('../helpers/parseProjectTasks.js')
const pool = require('../database/connection/connection.js')

// Dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
    console.log(req.session)

    // Get Projects
    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ?", [req.session.user.userId])    
    projects.forEach(project => {
        project.tasks = parseProjectTasks(project.tasks)
    })

    console.log("Project Data:", JSON.stringify(projects, null, 2))

    res.render("private/dashboard", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects: projects,
        projectId: null,
        currentPage: 'dashboard'
    })
})

// Vorplan
router.get('/planning/:id', requireAuth, async (req, res) => {
    const projectId = req.params.id

    const [projects] = await pool.query("SELECT * FROM projects WHERE userId = ? AND id = ?", [req.session.user.userId, projectId])

    if (projects.length === 0) {
        return res.status(404).render('error/404')
    }

    const project = projects[0]
    const tasks = parseProjectTasks(project.tasks)

    res.render("private/planning", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project,
        tasks: tasks,
        projectId: projectId,
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
        project.tasks = parseProjectTasks(project.tasks)
    })

    // Check if the Project has data. If no Data but Project was found the User has no access to it.
    if(project && project.length === 0) {
        return res.status(404).render('error/404')
    }

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/structureplan", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        projectId: projectId,
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
        project.tasks = parseProjectTasks(project.tasks)
    })

    // Check if the Project has data. If no Data but Project was found the User has no access to it.
    if(project && project.length === 0) {
        return res.status(404).render('error/404')
    }

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/bar_chart", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        projectId: projectId,
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
        project.tasks = parseProjectTasks(project.tasks)
    })

    // Check if the Project has data. If no Data but Project was found the User has no access to it.
    if(project && project.length === 0) {
        return res.status(404).render('error/404')
    }

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/cost_chart", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        projectId: projectId,
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
        project.tasks = parseProjectTasks(project.tasks)
    })

    // Check if the Project has data. If no Data but Project was found the User has no access to it.
    if(project && project.length === 0) {
        return res.status(404).render('error/404')
    }

    console.log("Project Data:", JSON.stringify(project, null, 2))

    res.render("private/network_plan", {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project: project,
        projectId: projectId,
        currentPage: 'network_plan'
    })
})

module.exports = router