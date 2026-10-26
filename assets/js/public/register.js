(() => {
    const form = document.querySelector('[data-register-form]')
    if (!form) return

    const password = form.elements.namedItem('password')
    const confirmation = form.elements.namedItem('password_confirm')
    const message = form.querySelector('[data-password-message]')

    // Give immediate feedback and keep the server-side password check authoritative.
    function validatePasswords() {
        const mismatch = confirmation.value.length > 0 && password.value !== confirmation.value
        confirmation.setCustomValidity(mismatch ? 'Die Passwörter stimmen nicht überein.' : '')
        message.textContent = mismatch ? 'Die Passwörter stimmen nicht überein.' : ''
    }

    form.addEventListener('input', validatePasswords)
    form.addEventListener('submit', event => {
        validatePasswords()
        if (!form.reportValidity()) event.preventDefault()
    })
})()
