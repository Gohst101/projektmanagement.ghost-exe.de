(function () {
	const processList = document.querySelector('.project-planning-process-titles').parentElement
	const projectId = processList.dataset.projectId
	const status = document.querySelector('[data-planning-status]')
	let saveTimer = null
	let saveInProgress = false
	let saveAgain = false

	// Collect all editable values before sending one complete, ordered project snapshot.
	function collectTasks() {
		return [...processList.querySelectorAll('.project-planning-process[draggable="true"]')]
			.map(tile => {
				const predecessorText = tile.querySelector('.project-planning-process-predecessor').textContent.trim()
				const days = Number(tile.querySelector('.project-planning-process-days').value)
				const workers = Number(tile.querySelector('.project-planning-process-workers').value)
				const salary = Number(tile.querySelector('.project-planning-process-salary').value)

				return {
					name: tile.querySelector('.project-planning-process-name').value.trim(),
					days,
					workers,
					salary,
					predecessor: predecessorText === 'Keine Vorgänger vorhanden.'
						? []
						: predecessorText.split(',').map(number => number.trim()).filter(Boolean)
				}
			})
	}

	async function savePlanningData() {
		if (saveInProgress) {
			saveAgain = true
			return
		}

		const tasks = collectTasks()
		const tiles = [...processList.querySelectorAll('.project-planning-process[draggable="true"]')]
		const invalidTaskIndex = tasks.findIndex((task, index) => {
			const values = ['.project-planning-process-name', '.project-planning-process-days',
				'.project-planning-process-workers', '.project-planning-process-salary']
				.map(selector => tiles[index].querySelector(selector).value.trim())
			return values.some(value => !value) || !task.name || task.name.length > 120
			|| !Number.isFinite(task.days) || task.days < 0
			|| !Number.isSafeInteger(task.workers) || task.workers < 0
			|| !Number.isFinite(task.salary) || task.salary < 0
		})
		if (invalidTaskIndex !== -1) {
			status.textContent = `Bitte prüfe die Angaben für Vorgang ${invalidTaskIndex + 1}.`
			return
		}

		saveInProgress = true
		status.textContent = 'Speichert …'
		try {
			const response = await fetch('/api/planning/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ projectId, tasks })
			})

			if (!response.ok) {
				const result = await response.json()
				throw new Error(result.error || `Speichern fehlgeschlagen (${response.status})`)
			}
			status.textContent = 'Änderungen gespeichert.'
		} catch (error) {
			console.error('Planungsdaten konnten nicht gespeichert werden:', error)
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
		window.clearTimeout(saveTimer)
		saveTimer = window.setTimeout(savePlanningData, 500)
	}

	processList.addEventListener('input', event => {
		if (event.target.matches('.project-planning-process-name, .project-planning-process-days, .project-planning-process-workers, .project-planning-process-salary')) {
			scheduleSave()
		}
	})
	processList.addEventListener('change', scheduleSave)
	processList.addEventListener('planningchange', scheduleSave)
})()
