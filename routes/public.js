const express = require('express')
const router = express.Router()

// Homepage
router.get('/homepage', async(req, res) => {
  console.log(`[Route] Homepage`)
  res.render('public/homepage')
})

// Register Page
router.get('/register', (req, res) => {
  res.render('public/register', {
    error: null
  })
})

// Login Page
router.get('/login', (req, res) => {
  if (req.session && req.session.user) { // Nutzer von Login direkt auf Dashboard weiterleiten wenn der Nutzer angemeldet ist
    return res.redirect('/dashboard')
  }
  res.render('public/login', {
    error: null
  })
})

module.exports = router