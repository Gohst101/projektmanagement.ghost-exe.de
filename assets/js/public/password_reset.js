(() => {
    const form = document.querySelector('[data-password-reset]')
    if (!form) return

    const password = form.elements.namedItem('password')
    const confirmation = form.elements.namedItem('password_confirm')
    const message = form.querySelector('[data-password-message]')

    // Prevent an avoidable round trip when the confirmation does not match.
    function validate() {
        const mismatch = confirmation.value.length > 0 && confirmation.value !== password.value
        confirmation.setCustomValidity(mismatch ? 'Die Passwörter stimmen nicht überein.' : '')
        message.textContent = mismatch ? 'Die Passwörter stimmen nicht überein.' : ''
    }

    form.addEventListener('input', validate)
    form.addEventListener('submit', event => {
        validate()
        if (!form.reportValidity()) event.preventDefault()
    })
})()
