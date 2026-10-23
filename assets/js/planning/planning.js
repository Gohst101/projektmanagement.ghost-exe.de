(function () {
	const processList = document.querySelector('.project-planning-process-titles').parentElement
	const projectId = processList.dataset.projectId
	let saveTimer = null

	function collectTasks() {
		return [...processList.querySelectorAll('.project-planning-process[draggable="true"]')]
			.map(tile => {
				const predecessorText = tile.querySelector('.project-planning-process-predecessor').textContent.trim()
				const days = Number(tile.querySelector('.project-planning-process-days').value)

				return {
					name: tile.querySelector('.project-planning-process-name').value.trim(),
					days: Number.isFinite(days) && days >= 0 ? days : 0,
					predecessor: predecessorText === 'Keine Vorgänger vorhanden.'
						? []
						: predecessorText.split(',').map(number => number.trim()).filter(Boolean)
				}
			})
	}

	async function savePlanningData() {
		try {
			const response = await fetch('/api/planning/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ projectId, tasks: collectTasks() })
			})

			if (!response.ok) {
				throw new Error(`Speichern fehlgeschlagen (${response.status})`)
			}
		} catch (error) {
			console.error('Planungsdaten konnten nicht gespeichert werden:', error)
		}
	}

	function scheduleSave() {
		window.clearTimeout(saveTimer)
		saveTimer = window.setTimeout(savePlanningData, 500)
	}

	processList.addEventListener('input', event => {
		if (event.target.matches('.project-planning-process-name, .project-planning-process-days')) {
			scheduleSave()
		}
	})
	processList.addEventListener('change', scheduleSave)
	processList.addEventListener('planningchange', scheduleSave)
})()

