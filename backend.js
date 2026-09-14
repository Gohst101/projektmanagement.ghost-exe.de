console.log("Starting Backend")

const express = require("express")

const app = express()
const PORT = 25590

app.get("/", (req, res) => {
    res.send("Projektmanagement läuft!")
})

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server läuft auf http://127.0.0.1:${PORT}`)
})