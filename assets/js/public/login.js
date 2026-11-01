(() => {
    const toggle = document.querySelector('[data-toggle-password]')
    const password = document.querySelector('#password')
    if (!toggle || !password) return

    toggle.addEventListener('click', () => {
        const showPassword = password.type === 'password'
        password.type = showPassword ? 'text' : 'password'
        toggle.textContent = showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'
        toggle.setAttribute('aria-pressed', String(showPassword))
    })
})()
