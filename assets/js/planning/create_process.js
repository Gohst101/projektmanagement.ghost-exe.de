(function () {
	const processList = document.querySelector('.project-planning-process-titles').parentElement
	const createProcessButton = processList.querySelector('.project-planning-process-create')
	const status = document.querySelector('[data-planning-status]')
	const noPredecessorText = 'Keine Vorgänger vorhanden.'

	function createProcessTile(name, number) {
		const tile = document.createElement('div')
		tile.className = 'project-planning-process'
		tile.draggable = true

		const numberElement = document.createElement('p')
		numberElement.className = 'project-planning-process-number'
		numberElement.textContent = String(number)

		const nameElement = document.createElement('input')
		nameElement.className = 'project-planning-process-name'
		nameElement.type = 'text'
		nameElement.value = name
		nameElement.draggable = false
		nameElement.setAttribute('aria-label', `Name des Vorgangs ${number}`)

		const daysElement = document.createElement('input')
		daysElement.className = 'project-planning-process-days'
		daysElement.type = 'number'
		daysElement.min = '0'
		daysElement.step = '1'
		daysElement.value = '0'
		daysElement.draggable = false
		daysElement.setAttribute('aria-label', `Tage für ${name}`)

		const workersElement = document.createElement('input')
		workersElement.className = 'project-planning-process-workers'
		workersElement.type = 'number'
		workersElement.min = '0'
		workersElement.step = '1'
		workersElement.value = '1'
		workersElement.draggable = false
		workersElement.setAttribute('aria-label', `Mitarbeitende für ${name}`)

		const salaryElement = document.createElement('input')
		salaryElement.className = 'project-planning-process-salary'
		salaryElement.type = 'number'
		salaryElement.min = '0'
		salaryElement.step = '0.01'
		salaryElement.value = '0'
		salaryElement.draggable = false
		salaryElement.setAttribute('aria-label', `Tagessatz in Euro für ${name}`)

		const predecessorSelect = document.createElement('div')
		predecessorSelect.className = 'project-planning-predecessor-select'

		const predecessorButton = document.createElement('button')
		predecessorButton.type = 'button'
		predecessorButton.className = 'project-planning-process-predecessor'
		predecessorButton.draggable = false
		predecessorButton.disabled = false
		predecessorButton.setAttribute('aria-haspopup', 'listbox')
		predecessorButton.setAttribute('aria-expanded', 'false')
		predecessorButton.textContent = noPredecessorText

		const predecessorOptions = document.createElement('div')
		predecessorOptions.className = 'project-planning-predecessor-options'
		predecessorOptions.setAttribute('role', 'listbox')

		const deleteButton = document.createElement('button')
		deleteButton.type = 'button'
		deleteButton.className = 'project-planning-process-delete'
		deleteButton.draggable = false
		deleteButton.setAttribute('aria-label', `Vorgang ${number} löschen`)

		const deleteIcon = document.createElement('img')
		deleteIcon.src = '/icons/trash.svg'
		deleteIcon.alt = ''
		deleteButton.append(deleteIcon)

		predecessorSelect.append(predecessorButton, predecessorOptions)
		tile.append(numberElement, nameElement, daysElement, workersElement, salaryElement, predecessorSelect, deleteButton)

		return tile
	}

	createProcessButton.addEventListener('click', () => {
		const processCount = processList.querySelectorAll('.project-planning-process[draggable="true"]').length
		if (processCount >= 100) {
			status.textContent = 'Ein Projekt kann höchstens 100 Vorgänge enthalten.'
			return
		}

		const name = window.prompt('Name des neuen Vorgangs:')
		const trimmedName = name?.trim()

		if (!trimmedName) {
			return
		}

		const tile = createProcessTile(trimmedName, processCount + 1)
		processList.insertBefore(tile, createProcessButton)
		processList.dispatchEvent(new CustomEvent('processcreated', { detail: { tile } }))
		processList.dispatchEvent(new CustomEvent('planningchange'))
	})
})()
