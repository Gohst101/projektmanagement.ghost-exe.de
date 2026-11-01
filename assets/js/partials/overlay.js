(() => {
    const toggle = document.querySelector('[data-sidebar-toggle]')
    const overlay = document.querySelector('[data-sidebar-overlay]')
    const sidebar = document.querySelector('#sidebar-navigation')
    if (!toggle || !overlay || !sidebar) return

    function setOpen(open) {
        document.body.classList.toggle('sidebar-open', open)
        toggle.setAttribute('aria-expanded', String(open))
    }

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true')
    })
    overlay.addEventListener('click', () => setOpen(false))
    sidebar.addEventListener('click', event => {
        if (event.target.closest('a')) setOpen(false)
    })
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setOpen(false)
    })
})()
