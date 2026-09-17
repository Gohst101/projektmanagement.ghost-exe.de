const express = require('express')
const router = express.Router()

// Homepage
router.get('/homepage', (req, res) => {
  console.log(`[Route] Homepage`)
  res.render('/public/homepage')
})


module.exports = router