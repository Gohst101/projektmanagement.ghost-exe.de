const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../middleware/requireAuth.js')
const pool = require('../../database/connection/connection.js')


// Create Project
router.post('/api/project/create', requireAuth, async (req, res) => {
    const {} = req.body // Get Form Data with id


})

// Update Project
router.post('/api/project/update', requireAuth, async (req, res) => {
    const {} = req.body // Get Form Data with id


})

// Delete Project
router.post('/api/project/delete', requireAuth, async (req, res) => {
    const {} = req.body // Get Form Data with id


})

module.exports = router