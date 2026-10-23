(function () {
	const processList = document.querySelector('.project-planning-process-titles').parentElement
	const noPredecessorText = 'Keine Vorgänger vorhanden.'

function getProcessTiles() {
	return [...processList.querySelectorAll('.project-planning-process[draggable="true"]')]
}

function getProcessName(tile) {
	const nameElement = tile.querySelector('.project-planning-process-name')
	return nameElement.value ?? nameElement.textContent.trim()
}

function getSelectedPredecessors(button) {
	const value = button.textContent.trim()

	if (!value || value === noPredecessorText) {
		return []
	}

	return value
		.split(',')
		.map(number => number.trim())
		.filter(Boolean)
}

function updatePredecessorButton(button, selectedNumbers) {
	button.textContent = selectedNumbers.length > 0
		? selectedNumbers.join(', ')
		: noPredecessorText
}

function renderPredecessorOptions(tile) {
	const button = tile.querySelector('.project-planning-process-predecessor')
	const options = tile.querySelector('.project-planning-predecessor-options')
	const tileNumber = tile.querySelector('.project-planning-process-number').textContent.trim()
	const selectedNumbers = getSelectedPredecessors(button)

	options.replaceChildren()

	getProcessTiles().forEach(candidateTile => {
		const candidateNumber = candidateTile.querySelector('.project-planning-process-number').textContent.trim()

		if (candidateTile === tile) {
			return
		}

		const option = document.createElement('button')
		option.type = 'button'
		option.draggable = false
		option.className = 'project-planning-predecessor-option'
		option.setAttribute('role', 'option')
		option.dataset.number = candidateNumber
		option.textContent = `${candidateNumber}. ${getProcessName(candidateTile)}`

		if (selectedNumbers.includes(candidateNumber)) {
			option.classList.add('selected')
			option.setAttribute('aria-selected', 'true')
		}

		option.addEventListener('click', event => {
			event.stopPropagation()
			const selected = option.classList.toggle('selected')
			option.setAttribute('aria-selected', String(selected))

			const updatedNumbers = [...options.querySelectorAll('.project-planning-predecessor-option.selected')]
				.map(selectedOption => selectedOption.dataset.number)
				.sort((firstNumber, secondNumber) => Number(firstNumber) - Number(secondNumber))

			updatePredecessorButton(button, updatedNumbers)
			processList.dispatchEvent(new CustomEvent('planningchange'))
		})

		options.append(option)
	})

	if (tileNumber === '1') {
		button.disabled = true
		button.setAttribute('aria-disabled', 'true')
		updatePredecessorButton(button, [])
	} else {
		button.disabled = false
		button.removeAttribute('aria-disabled')
	}
}

function closePredecessorMenus() {
	processList.querySelectorAll('.project-planning-predecessor-select.open').forEach(select => {
		select.classList.remove('open')
		select.querySelector('.project-planning-process-predecessor').setAttribute('aria-expanded', 'false')
	})
}

getProcessTiles().forEach(tile => {
	const select = tile.querySelector('.project-planning-predecessor-select')
	const button = tile.querySelector('.project-planning-process-predecessor')

	renderPredecessorOptions(tile)

	button.addEventListener('click', event => {
		event.stopPropagation()

		if (button.disabled) {
			return
		}

		const wasOpen = select.classList.contains('open')
		closePredecessorMenus()
		select.classList.toggle('open', !wasOpen)
		button.setAttribute('aria-expanded', String(!wasOpen))
	})
})

document.addEventListener('click', closePredecessorMenus)
processList.addEventListener('processorderchange', () => {
	getProcessTiles().forEach(renderPredecessorOptions)
})

processList.addEventListener('processcreated', () => {
	getProcessTiles().forEach(renderPredecessorOptions)
})

processList.addEventListener('input', event => {
	if (event.target.matches('.project-planning-process-name')) {
		getProcessTiles().forEach(renderPredecessorOptions)
	}
})
})()
