const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../middleware/requireAuth.js')
const pool = require('../../database/connection/connection.js')


// Store data
router.post('/api/planning/save', requireAuth, async (req, res) => {
    const { projectId, tasks } = req.body
    const numericProjectId = Number(projectId)

    if (!Number.isSafeInteger(numericProjectId) || numericProjectId <= 0 || !Array.isArray(tasks) || tasks.length > 100) {
        return res.status(400).json({ error: 'Ungültige Planungsdaten.' })
    }

    try {
        const [projects] = await pool.query(
            'SELECT id, tasks FROM projects WHERE id = ? AND userId = ?',
            [numericProjectId, req.session.user.userId]
        )

        if (projects.length === 0) {
            return res.status(404).json({ error: 'Projekt nicht gefunden.' })
        }

        const normalizedTasks = []
        let predecessorCount = 0
        for (const [index, task] of tasks.entries()) {
            const name = typeof task?.name === 'string' ? task.name.trim() : ''
            const days = Number(task?.days)
            const workers = Number(task?.workers)
            const salary = Number(task?.salary)
            if (!Array.isArray(task?.predecessor)) {
                return res.status(400).json({ error: `Ungültige Vorgänger für Vorgang ${index + 1}.` })
            }
            const predecessor = [...new Set(task.predecessor.map(value => String(value).trim()).filter(Boolean))]

            if (!name || name.length > 120 || task?.days == null || String(task.days).trim() === ''
                || !Number.isFinite(days) || days < 0 || days > 36500
                || task?.workers == null || String(task.workers).trim() === ''
                || !Number.isSafeInteger(workers) || workers < 0 || workers > 100000
                || task?.salary == null || String(task.salary).trim() === ''
                || !Number.isFinite(salary) || salary < 0 || salary > 100000000) {
                return res.status(400).json({ error: `Ungültige Angaben für Vorgang ${index + 1}.` })
            }

            if (predecessor.some(value => !/^\d+$/.test(value)
                || Number(value) < 1
                || Number(value) > tasks.length
                || Number(value) === index + 1)) {
                return res.status(400).json({ error: `Ungültige Vorgänger für Vorgang ${index + 1}.` })
            }
            predecessorCount += predecessor.length
            if (predecessorCount > 2000) {
                return res.status(400).json({ error: 'Der Plan enthält zu viele Vorgängerbeziehungen.' })
            }

            normalizedTasks.push({
                position: index + 1,
                name,
                days,
                workers,
                salary,
                predecessor
            })
        }

        // Reject dependency loops so the schedule and network plan remain computable.
        const dependencyMap = new Map(normalizedTasks.map(task => [
            task.position,
            task.predecessor.map(Number)
        ]))
        const visited = new Set()
        const active = new Set()
        function hasDependencyCycle(position) {
            if (active.has(position)) return true
            if (visited.has(position)) return false

            active.add(position)
            for (const predecessor of dependencyMap.get(position) || []) {
                if (hasDependencyCycle(predecessor)) return true
            }
            active.delete(position)
            visited.add(position)
            return false
        }

        if ([...dependencyMap.keys()].some(hasDependencyCycle)) {
            return res.status(400).json({ error: 'Die Vorgänger dürfen keinen Abhängigkeitskreis bilden.' })
        }

        let existingData
        try {
            existingData = typeof projects[0].tasks === 'string'
                ? JSON.parse(projects[0].tasks || '{}')
                : projects[0].tasks || {}
        } catch (error) {
            console.error('Invalid stored project data while saving planning:', error)
            return res.status(500).json({ error: 'Die vorhandenen Projektdaten sind ungültig.' })
        }

        await pool.query(
            'UPDATE projects SET tasks = ? WHERE id = ? AND userId = ?',
            [JSON.stringify({ ...existingData, tasks: normalizedTasks }), numericProjectId, req.session.user.userId]
        )

        return res.json({ success: true })
    } catch (error) {
        console.error('Planning data could not be saved:', error)
        return res.status(500).json({ error: 'Planungsdaten konnten nicht gespeichert werden.' })
    }
})

module.exports = router