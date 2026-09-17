const express = require('express')
const router = express.Router()

// Homepage
router.get('/homepage', async(req, res) => {
  console.log(`[Route] Homepage`)
  res.render('public/homepage')
})

// Register
router.get('/register', async(req, res) => {
  console.log(`[Route] Register`)
  res.render('public/register')
})

// Login
router.get('/login', async(req, res) => {
  console.log(`[Route] Login`)
  res.render('public/login')
})


module.exports = router