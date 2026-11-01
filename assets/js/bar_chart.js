(() => {
    const chart = document.querySelector('[data-bar-chart]')
    if (!chart) return

    const status = document.querySelector('[data-chart-status]')
    const tableHead = chart.querySelector('thead')
    const tableBody = chart.querySelector('tbody')

    try {
        // Reuse the dependency-based schedule to place each task on its earliest possible day.
        const result = window.ProjectChartData.schedule(window.ProjectChartData.readTasks(chart))
        const daysPerColumn = Math.max(1, Math.ceil(result.duration / 365))
        const periodCount = Math.max(1, Math.ceil(result.duration / daysPerColumn))
        const heading = document.createElement('tr')

        ;['Nr.', 'Vorgang', 'Dauer', 'Vorgänger'].forEach(label => {
            const cell = document.createElement('th')
            cell.scope = 'col'
            cell.textContent = label
            heading.append(cell)
        })
        for (let period = 0; period < periodCount; period += 1) {
            const cell = document.createElement('th')
            cell.scope = 'col'
            const firstDay = period * daysPerColumn + 1
            const lastDay = Math.min(result.duration, firstDay + daysPerColumn - 1)
            cell.textContent = daysPerColumn === 1 ? String(firstDay) : `${firstDay}–${lastDay}`
            heading.append(cell)
        }
        tableHead.append(heading)

        result.tasks.forEach(task => {
            const row = document.createElement('tr')
            const details = [
                task.id,
                task.title,
                `${task.days} ${task.days === 1 ? 'Tag' : 'Tage'}`,
                task.predecessors.join(', ') || '–'
            ]
            details.forEach((value, index) => {
                const cell = document.createElement('td')
                cell.textContent = value
                if (index === 1) cell.className = 'bar-chart-process-title'
                row.append(cell)
            })

            const firstPeriod = Math.floor(task.start / daysPerColumn)
            const lastPeriod = Math.max(firstPeriod, Math.ceil(task.finish / daysPerColumn) - 1)
            for (let period = 0; period < periodCount; period += 1) {
                const cell = document.createElement('td')
                cell.className = 'bar-chart-duration-cell'
                const periodStart = period * daysPerColumn
                const periodEnd = periodStart + daysPerColumn
                if (task.days > 0 && task.start < periodEnd && task.finish > periodStart) {
                    cell.classList.add('bar-chart-task-day')
                    if (period === firstPeriod) cell.classList.add('bar-chart-task-start')
                    if (period === lastPeriod) cell.classList.add('bar-chart-task-end')
                    if (firstPeriod === lastPeriod) cell.classList.add('bar-chart-task-single')
                    cell.setAttribute('aria-label', `${task.title}, Tag ${periodStart + 1} bis ${Math.min(result.duration, periodEnd)}`)
                }
                row.append(cell)
            }
            tableBody.append(row)
        })

        status.textContent = result.tasks.length
            ? `Projektdauer: ${result.duration} ${result.duration === 1 ? 'Tag' : 'Tage'}.`
            : 'Noch keine Vorgänge vorhanden. Füge zuerst Vorgänge in der Vorplanung hinzu.'
    } catch (error) {
        status.textContent = error.message
    }
})()
