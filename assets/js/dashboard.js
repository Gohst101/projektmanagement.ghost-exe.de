(() => {
    const dashboard = document.querySelector('[data-project-dashboard]')

    if (!dashboard) {
        return
    }

    const dialog = dashboard.querySelector('[data-project-dialog]')
    const form = dashboard.querySelector('[data-project-form]')
    const message = dashboard.querySelector('.dashboard-message')
    const errorMessage = dashboard.querySelector('.project-dialog-error')
    const titleInput = form.elements.namedItem('title')
    const descriptionInput = form.elements.namedItem('description')
    let editingProjectId = null

    function showDialog(project = null) {
        editingProjectId = project?.dataset.projectId || null
        form.reset()
        errorMessage.textContent = ''
        dashboard.querySelector('[data-dialog-title]').textContent = editingProjectId
            ? 'Projekt bearbeiten'
            : 'Neues Projekt erstellen'

        if (project) {
            titleInput.value = project.querySelector('.project-title').textContent.trim()
            descriptionInput.value = project.querySelector('.project-description').textContent.trim()
        }

        dialog.showModal()
        titleInput.focus()
    }

    async function sendProjectRequest(endpoint, payload) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        })
        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.error || 'Die Anfrage ist fehlgeschlagen.')
        }

        return result
    }

    dashboard.addEventListener('click', async event => {
        if (event.target.closest('[data-create-project]')) {
            showDialog()
            return
        }

        if (event.target.closest('[data-close-dialog]')) {
            dialog.close()
            return
        }

        const card = event.target.closest('[data-project-card]')
        if (!card) {
            return
        }

        if (event.target.closest('[data-edit-project]')) {
            showDialog(card)
            return
        }

        if (event.target.closest('[data-delete-project]')) {
            if (!window.confirm('Möchtest du dieses Projekt wirklich löschen?')) {
                return
            }

            try {
                await sendProjectRequest('/api/project/delete', { projectId: card.dataset.projectId })
                card.remove()
                message.textContent = 'Projekt wurde gelöscht.'
            } catch (error) {
                message.textContent = error.message
            }
        }
    })

    // Submit either creates a project or updates the selected project.
    form.addEventListener('submit', async event => {
        event.preventDefault()
        errorMessage.textContent = ''

        const endpoint = editingProjectId ? '/api/project/update' : '/api/project/create'
        const payload = {
            title: titleInput.value,
            description: descriptionInput.value
        }

        if (editingProjectId) {
            payload.projectId = editingProjectId
        }

        const submitButton = form.querySelector('[type="submit"]')
        submitButton.disabled = true

        try {
            const result = await sendProjectRequest(endpoint, payload)

            if (result.projectId) {
                window.location.assign(`/planning/${result.projectId}`)
                return
            }

            dialog.close()
            window.location.reload()
        } catch (error) {
            errorMessage.textContent = error.message
        } finally {
            submitButton.disabled = false
        }
    })
})()
