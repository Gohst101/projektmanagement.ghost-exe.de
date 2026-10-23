(function () {
	const processList = document.querySelector('.project-planning-process-titles').parentElement

	processList.addEventListener('click', event => {
		const deleteButton = event.target.closest('.project-planning-process-delete')

		if (!deleteButton) {
			return
		}

		event.preventDefault()
		event.stopPropagation()

		if (!window.confirm('Diesen Vorgang wirklich löschen?')) {
			return
		}

		const tile = deleteButton.closest('.project-planning-process')
		tile?.remove()
		processList.dispatchEvent(new CustomEvent('processdeleted'))
	})
})()
