const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../middleware/requireAuth.js')
const pool = require('../../database/connection/connection.js')


// Store data
router.post('/api/planning/save', requireAuth, async (req, res) => {
    const {} = req.body // Get Form Data with id


})

module.exports = router