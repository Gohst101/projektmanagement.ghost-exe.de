(() => {
    const page = document.querySelector('[data-structureplan]')
    if (!page) return

    const container = page.querySelector('#categories-container')
    const status = page.querySelector('.structureplan-status')
    const projectId = page.dataset.projectId
    let saveTimer
    let saveInProgress = false
    let saveAgain = false

    // Construct every editable row with DOM APIs rather than inserting user text as HTML.
    function createTextInput(className, label, value) {
        const input = document.createElement('input')
        input.type = 'text'
        input.maxLength = 120
        input.className = className
        input.value = value
        input.setAttribute('aria-label', label)
        return input
    }

    function createRemoveButton(attribute, label) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'remove-item'
        button.dataset[attribute] = ''
        button.setAttribute('aria-label', label)
        button.textContent = '×'
        return button
    }

    function addSubcategory(category) {
        if (container.querySelectorAll('[data-subcategory]').length >= 200) {
            status.textContent = 'Der Strukturplan kann höchstens 200 Unterkategorien enthalten.'
            return
        }

        const row = document.createElement('div')
        row.className = 'subcategory-box'
        row.dataset.subcategory = ''
        row.append(
            createTextInput('', 'Name der Unterkategorie', 'Neue Unterkategorie'),
            createRemoveButton('removeSubcategory', 'Unterkategorie löschen')
        )
        category.querySelector('.subcategories').append(row)
        row.querySelector('input').focus()
        row.querySelector('input').select()
        scheduleSave()
    }

    function addCategory() {
        if (container.querySelectorAll('[data-category]').length >= 100) {
            status.textContent = 'Der Strukturplan kann höchstens 100 Kategorien enthalten.'
            return
        }

        const section = document.createElement('section')
        section.className = 'category'
        section.dataset.category = ''

        const box = document.createElement('div')
        box.className = 'category-box'
        const title = createTextInput('category-title', 'Name der Kategorie', 'Neue Kategorie')
        box.append(title, createRemoveButton('removeCategory', 'Kategorie löschen'))

        const addButton = document.createElement('button')
        addButton.type = 'button'
        addButton.className = 'add-subcategory'
        addButton.dataset.addSubcategory = ''
        addButton.setAttribute('aria-label', 'Unterkategorie hinzufügen')
        addButton.textContent = '+'

        const subcategories = document.createElement('div')
        subcategories.className = 'subcategories'
        section.append(box, addButton, subcategories)
        container.append(section)
        title.focus()
        title.select()
        scheduleSave()
    }

    function collectCategories() {
        return [...container.querySelectorAll('[data-category]')].map(category => ({
            title: category.querySelector('.category-title').value.trim(),
            subcategories: [...category.querySelectorAll('[data-subcategory] input')]
                .map(input => ({ title: input.value.trim() }))
        }))
    }

    async function saveCategories() {
        if (saveInProgress) {
            saveAgain = true
            return
        }

        const categories = collectCategories()
        if (categories.some(category => !category.title || category.subcategories.some(item => !item.title))) {
            status.textContent = 'Bitte fülle alle Kategorien und Unterkategorien aus.'
            return
        }

        status.textContent = 'Speichert …'
        saveInProgress = true
        try {
            const response = await fetch('/api/structureplan/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ projectId, categories })
            })
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Der Strukturplan konnte nicht gespeichert werden.')
            }
            status.textContent = 'Änderungen gespeichert.'
        } catch (error) {
            status.textContent = error.message
        } finally {
            saveInProgress = false
            if (saveAgain) {
                saveAgain = false
                scheduleSave()
            }
        }
    }

    function scheduleSave() {
        // Debounce edits so a rapid typing sequence produces one database update.
        window.clearTimeout(saveTimer)
        saveTimer = window.setTimeout(saveCategories, 500)
    }

    page.addEventListener('input', event => {
        if (event.target.matches('.category-title, .subcategory-box input')) {
            scheduleSave()
        }
    })

    page.addEventListener('click', event => {
        if (event.target.closest('[data-add-category]')) {
            addCategory()
            return
        }

        const category = event.target.closest('[data-category]')
        if (event.target.closest('[data-add-subcategory]') && category) {
            addSubcategory(category)
            return
        }

        if (event.target.closest('[data-remove-category]')) {
            category.remove()
            scheduleSave()
            return
        }

        if (event.target.closest('[data-remove-subcategory]')) {
            event.target.closest('[data-subcategory]').remove()
            scheduleSave()
        }
    })
})()
