const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../middleware/requireAuth.js')
const pool = require('../../database/connection/connection.js')

// Keep every project operation scoped to the authenticated account.
router.post('/api/project/create', requireAuth, async (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : ''

    if (!title || title.length > 120 || description.length > 2000) {
        return res.status(400).json({ error: 'Bitte gib einen gültigen Projektnamen und eine kurze Beschreibung ein.' })
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO projects (userId, title, description, tasks) VALUES (?, ?, ?, ?)',
            [req.session.user.userId, title, description || null, JSON.stringify({ tasks: [], categories: [] })]
        )

        return res.status(201).json({ success: true, projectId: result.insertId })
    } catch (error) {
        console.error('Project could not be created:', error)
        return res.status(500).json({ error: 'Das Projekt konnte nicht erstellt werden.' })
    }
})

router.post('/api/project/update', requireAuth, async (req, res) => {
    const projectId = Number(req.body.projectId)
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : ''

    if (!Number.isSafeInteger(projectId) || projectId <= 0 || !title || title.length > 120 || description.length > 2000) {
        return res.status(400).json({ error: 'Ungültige Projektdaten.' })
    }

    try {
        const [projects] = await pool.query(
            'SELECT id FROM projects WHERE id = ? AND userId = ?',
            [projectId, req.session.user.userId]
        )
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Projekt nicht gefunden.' })
        }

        await pool.query(
            'UPDATE projects SET title = ?, description = ? WHERE id = ? AND userId = ?',
            [title, description || null, projectId, req.session.user.userId]
        )
        return res.json({ success: true })
    } catch (error) {
        console.error('Project could not be updated:', error)
        return res.status(500).json({ error: 'Das Projekt konnte nicht gespeichert werden.' })
    }
})

router.post('/api/project/delete', requireAuth, async (req, res) => {
    const projectId = Number(req.body.projectId)

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
        return res.status(400).json({ error: 'Ungültige Projekt-ID.' })
    }

    try {
        const [result] = await pool.query(
            'DELETE FROM projects WHERE id = ? AND userId = ?',
            [projectId, req.session.user.userId]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Projekt nicht gefunden.' })
        }

        return res.json({ success: true })
    } catch (error) {
        console.error('Project could not be deleted:', error)
        return res.status(500).json({ error: 'Das Projekt konnte nicht gelöscht werden.' })
    }
})

module.exports = router
