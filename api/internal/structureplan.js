const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../middleware/requireAuth.js')
const pool = require('../../database/connection/connection.js')

// Save the structure tree inside the project's existing JSON data column.
router.post('/api/structureplan/save', requireAuth, async (req, res) => {
    const projectId = Number(req.body.projectId)
    const { categories } = req.body

    if (!Number.isSafeInteger(projectId) || projectId <= 0 || !Array.isArray(categories) || categories.length > 100) {
        return res.status(400).json({ error: 'Ungültige Strukturplandaten.' })
    }

    const normalizedCategories = []
    let subcategoryCount = 0
    for (const [index, category] of categories.entries()) {
        const title = typeof category?.title === 'string' ? category.title.trim() : ''
        const subcategories = category?.subcategories

        if (!title || title.length > 120 || !Array.isArray(subcategories)) {
            return res.status(400).json({ error: `Ungültige Kategorie ${index + 1}.` })
        }

        subcategoryCount += subcategories.length
        if (subcategoryCount > 200) {
            return res.status(400).json({ error: 'Der Strukturplan enthält zu viele Unterkategorien.' })
        }
        const normalizedSubcategories = []
        for (const subcategory of subcategories) {
            const subcategoryTitle = typeof subcategory?.title === 'string' ? subcategory.title.trim() : ''
            if (!subcategoryTitle || subcategoryTitle.length > 120) {
                return res.status(400).json({ error: `Ungültige Unterkategorie in „${title}“.` })
            }
            normalizedSubcategories.push({ title: subcategoryTitle })
        }
        normalizedCategories.push({ title, subcategories: normalizedSubcategories })
    }

    try {
        const [projects] = await pool.query(
            'SELECT tasks FROM projects WHERE id = ? AND userId = ?',
            [projectId, req.session.user.userId]
        )

        if (projects.length === 0) {
            return res.status(404).json({ error: 'Projekt nicht gefunden.' })
        }

        let projectData
        try {
            projectData = typeof projects[0].tasks === 'string'
                ? JSON.parse(projects[0].tasks || '{}')
                : projects[0].tasks || {}
        } catch (error) {
            console.error('Invalid stored project data while saving structure plan:', error)
            return res.status(500).json({ error: 'Die vorhandenen Projektdaten sind ungültig.' })
        }

        await pool.query(
            'UPDATE projects SET tasks = ? WHERE id = ? AND userId = ?',
            [JSON.stringify({ ...projectData, categories: normalizedCategories }), projectId, req.session.user.userId]
        )

        return res.json({ success: true })
    } catch (error) {
        console.error('Structure plan could not be saved:', error)
        return res.status(500).json({ error: 'Der Strukturplan konnte nicht gespeichert werden.' })
    }
})

module.exports = router
