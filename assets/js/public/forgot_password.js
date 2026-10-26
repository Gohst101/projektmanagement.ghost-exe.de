(() => {
    const form = document.querySelector('[data-reset-request]')
    if (!form) return

    // Show a pending state and block accidental duplicate reset-email requests.
    form.addEventListener('submit', () => {
        const button = form.querySelector('button[type="submit"]')
        button.disabled = true
        button.textContent = 'Anfrage wird gesendet …'
        form.querySelector('[data-request-status]').textContent = 'Bitte warte einen Moment.'
    })
})()
