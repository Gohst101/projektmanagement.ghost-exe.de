const express = require('express')
const router = express.Router()

// Add redirect routes here as needed

// index => Homepage
router.get('/', (req, res) => {
  console.log(`[Route] index => Homepage`)
  res.redirect('/homepage')
})


module.exports = router