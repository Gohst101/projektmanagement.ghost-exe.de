const express = require('express')
const router = express.Router()
require('dotenv').config()

const LITTLE_DEV_GHOST_DISCORD_CODE = process.env.LITTLE_DEV_GHOST_DISCORD_CODE
const SHADOW_DISCORD_CODE = process.env.SHADOW_DISCORD_CODE
const HIGHER_BIT_DISCORD_CODE = process.env.HIGHER_BIT_DISCORD_CODE
const ITS_JUST_CYRO_DISCORD_CODE = process.env.ITS_JUST_CYRO_DISCORD_CODE

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

// Discord Profile Links
router.get('/.well-known/discord', (req, res) => {
  res.type('text/plain')
  res.send(`${LITTLE_DEV_GHOST_DISCORD_CODE}\n${SHADOW_DISCORD_CODE}\n${HIGHER_BIT_DISCORD_CODE}\n${ITS_JUST_CYRO_DISCORD_CODE}`)
})

module.exports = router