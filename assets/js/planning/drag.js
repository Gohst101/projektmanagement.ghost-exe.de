const processList = document.querySelector('.project-planning-process-titles').parentElement
let processTiles = [...processList.querySelectorAll('.project-planning-process[draggable="true"]')]
const createProcessButton = processList.querySelector('.project-planning-process-create')

let draggedTile = null
let dropPlaceholder = null

// Moves the visible insertion gap to the position under the pointer.
function moveDropPlaceholder(clientY) {
	const remainingTiles = processTiles.filter(tile => tile !== draggedTile && tile.parentElement === processList)
	const tileAfterDropPosition = remainingTiles.find(tile => {
		const tileBox = tile.getBoundingClientRect()
		return clientY < tileBox.top + tileBox.height / 2
	})

	processList.insertBefore(dropPlaceholder, tileAfterDropPosition || createProcessButton)
}

// Refreshes display numbers and predecessor references after reordering.
function updateProcessNumbersAndPredecessors() {
	const orderedTiles = processTiles
		.filter(tile => tile.parentElement === processList)
		.sort((firstTile, secondTile) => {
			return [...processList.children].indexOf(firstTile) - [...processList.children].indexOf(secondTile)
		})
	const numberMap = new Map()

	orderedTiles.forEach((tile, index) => {
		const numberElement = tile.querySelector('.project-planning-process-number')
		numberMap.set(numberElement.textContent.trim(), String(index + 1))
	})

	orderedTiles.forEach((tile, index) => {
		tile.querySelector('.project-planning-process-number').textContent = String(index + 1)

		const predecessorElement = tile.querySelector('.project-planning-process-predecessor')
		if (index === 0) {
			predecessorElement.textContent = 'Keine Vorgänger vorhanden.'
			return
		}

		const predecessorText = predecessorElement.textContent.trim()

		if (!predecessorText || predecessorText === 'Keine Vorgänger vorhanden.') {
			return
		}

		predecessorElement.textContent = predecessorText
			.split(',')
			.map(number => numberMap.get(number.trim()))
			.filter(Boolean)
			.join(', ')

		if (!predecessorElement.textContent) {
			predecessorElement.textContent = 'Keine Vorgänger vorhanden.'
		}
	})
}

function initializeDragTile(tile) {
	tile.addEventListener('dragstart', event => {
		if (event.target.closest('input, button, select, textarea')) {
			event.preventDefault()
			return
		}

		draggedTile = tile
		dropPlaceholder = document.createElement('div')
		dropPlaceholder.className = 'project-planning-process-placeholder'
		dropPlaceholder.style.height = `${tile.offsetHeight}px`
		processList.insertBefore(dropPlaceholder, tile)

		tile.classList.add('dragging')
		tile.style.position = 'fixed'
		tile.style.left = '-10000px'
		tile.style.top = '0'
		tile.style.visibility = 'hidden'

		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', tile.querySelector('.project-planning-process-number').textContent)
	})

	tile.addEventListener('dragend', () => {
		if (dropPlaceholder?.parentElement) {
			processList.insertBefore(draggedTile, dropPlaceholder)
			dropPlaceholder.remove()
			updateProcessNumbersAndPredecessors()
			processList.dispatchEvent(new CustomEvent('processorderchange'))
			processList.dispatchEvent(new CustomEvent('planningchange'))
		}

		tile.classList.remove('dragging')
		tile.style.position = ''
		tile.style.left = ''
		tile.style.top = ''
		tile.style.visibility = ''
		dropPlaceholder = null
		draggedTile = null
	})
}

processTiles.forEach(initializeDragTile)

processList.addEventListener('processcreated', event => {
	const tile = event.detail.tile
	processTiles.push(tile)
	initializeDragTile(tile)
	updateProcessNumbersAndPredecessors()
	processList.dispatchEvent(new CustomEvent('processorderchange'))
})

processList.addEventListener('processdeleted', () => {
	updateProcessNumbersAndPredecessors()
	processList.dispatchEvent(new CustomEvent('processorderchange'))
	processList.dispatchEvent(new CustomEvent('planningchange'))
})

processList.addEventListener('dragover', event => {
	if (!draggedTile) {
		return
	}

	event.preventDefault()
	moveDropPlaceholder(event.clientY)
})

processList.addEventListener('drop', event => {
	if (draggedTile) {
		event.preventDefault()
	}
})

updateProcessNumbersAndPredecessors()
