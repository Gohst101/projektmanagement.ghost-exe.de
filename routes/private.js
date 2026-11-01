const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/requireAuth.js')
const { parseProjectData } = require('../helpers/parseProjectData.js')
const pool = require('../database/connection/connection.js')

// Load only projects owned by the signed-in user for every project view.
async function loadProject(projectId, userId) {
    const [projects] = await pool.query(
        'SELECT * FROM projects WHERE id = ? AND userId = ?',
        [projectId, userId]
    )

    if (projects.length === 0) {
        return null
    }

    const project = projects[0]
    const projectData = parseProjectData(project.tasks)
    project.tasks = projectData.tasks
    project.categories = projectData.categories

    return project
}

router.get('/dashboard', requireAuth, async (req, res) => {
    const [projects] = await pool.query(
        'SELECT id, title, description, tasks, created_at FROM projects WHERE userId = ? ORDER BY created_at DESC',
        [req.session.user.userId]
    )

    projects.forEach(project => {
        project.tasks = parseProjectData(project.tasks).tasks
    })

    res.render('private/dashboard', {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        projects,
        projectId: null,
        currentPage: 'dashboard'
    })
})

router.get('/planning/:id', requireAuth, async (req, res) => {
    const project = await loadProject(req.params.id, req.session.user.userId)

    if (!project) {
        return res.status(404).render('error/404')
    }

    res.render('private/planning', {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project,
        tasks: project.tasks,
        projectId: project.id,
        currentPage: 'planning'
    })
})

router.get('/structureplan/:id', requireAuth, async (req, res) => {
    const project = await loadProject(req.params.id, req.session.user.userId)

    if (!project) {
        return res.status(404).render('error/404')
    }

    res.render('private/structureplan', {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project,
        projectId: project.id,
        currentPage: 'structureplan'
    })
})

router.get('/bar_chart/:id', requireAuth, async (req, res) => {
    const project = await loadProject(req.params.id, req.session.user.userId)

    if (!project) {
        return res.status(404).render('error/404')
    }

    res.render('private/bar_chart', {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project,
        projectId: project.id,
        currentPage: 'bar_chart'
    })
})

router.get('/cost_chart/:id', requireAuth, async (req, res) => {
    const project = await loadProject(req.params.id, req.session.user.userId)

    if (!project) {
        return res.status(404).render('error/404')
    }

    res.render('private/cost_chart', {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project,
        projectId: project.id,
        currentPage: 'cost_chart'
    })
})

router.get('/network_plan/:id', requireAuth, async (req, res) => {
    const project = await loadProject(req.params.id, req.session.user.userId)

    if (!project) {
        return res.status(404).render('error/404')
    }

    res.render('private/network_plan', {
        userId: req.session.user.userId,
        username: req.session.user.username,
        email: req.session.user.email,
        project,
        projectId: project.id,
        currentPage: 'network_plan'
    })
})

module.exports = router
