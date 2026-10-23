const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../middleware/requireAuth.js')
const pool = require('../../database/connection/connection.js')


// Store data
router.post('/api/planning/save', requireAuth, async (req, res) => {
    const { projectId, tasks } = req.body

    if (!projectId || !Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Ungültige Planungsdaten.' })
    }

    try {
        const [projects] = await pool.query(
            'SELECT id FROM projects WHERE id = ? AND userId = ?',
            [projectId, req.session.user.userId]
        )

        if (projects.length === 0) {
            return res.status(404).json({ error: 'Projekt nicht gefunden.' })
        }

        const normalizedTasks = tasks.map((task, index) => ({
            position: index + 1,
            name: String(task.name || '').trim(),
            days: Math.max(0, Number(task.days) || 0),
            predecessor: Array.isArray(task.predecessor) ? task.predecessor.map(number => String(number).trim()).filter(Boolean) : []
        }))

        await pool.query(
            'UPDATE projects SET tasks = ? WHERE id = ? AND userId = ?',
            [JSON.stringify({ tasks: normalizedTasks }), projectId, req.session.user.userId]
        )

        return res.json({ success: true })
    } catch (error) {
        console.error('Planning data could not be saved:', error)
        return res.status(500).json({ error: 'Planungsdaten konnten nicht gespeichert werden.' })
    }
})

module.exports = router