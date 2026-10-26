(() => {
    const chart = document.querySelector('[data-cost-chart]')
    if (!chart) return

    const status = chart.querySelector('[data-chart-status]')
    const workersContainer = chart.querySelector('[data-workers-bars]')
    const costContainer = chart.querySelector('[data-cost-bars]')
    const totalElement = chart.querySelector('[data-cost-total]')
    const currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })

    // Render values as text and bars so the page needs no charting dependency.
    function createBarRow(task, value, maxValue, format) {
        const row = document.createElement('div')
        row.className = 'cost-chart-row'

        const label = document.createElement('span')
        label.className = 'cost-chart-label'
        label.textContent = `${task.id}. ${task.title}`

        const track = document.createElement('div')
        track.className = 'cost-chart-track'
        track.setAttribute('role', 'meter')
        track.setAttribute('aria-valuemin', '0')
        track.setAttribute('aria-valuemax', String(maxValue))
        track.setAttribute('aria-valuenow', String(value))
        track.setAttribute('aria-label', `${task.title}: ${format(value)}`)

        const fill = document.createElement('div')
        fill.className = 'cost-chart-fill'
        fill.style.width = `${maxValue > 0 ? value / maxValue * 100 : 0}%`
        track.append(fill)

        const amount = document.createElement('span')
        amount.className = 'cost-chart-value'
        amount.textContent = format(value)
        row.append(label, track, amount)
        return row
    }

    try {
        const tasks = window.ProjectChartData.readTasks(chart)
        // The daily rate is per person, so multiply by both assigned staff and duration.
        const costs = tasks.map(task => task.workers * task.days * task.salary)
        const maximumWorkers = Math.max(0, ...tasks.map(task => task.workers))
        const maximumCost = Math.max(0, ...costs)

        tasks.forEach((task, index) => {
            workersContainer.append(createBarRow(task, task.workers, maximumWorkers, value => `${value} Personen`))
            costContainer.append(createBarRow(task, costs[index], maximumCost, value => currency.format(value)))
        })

        totalElement.textContent = `Gesamtkosten: ${currency.format(costs.reduce((sum, value) => sum + value, 0))}`
        status.textContent = tasks.length
            ? 'Die Werte basieren auf den Angaben in der Vorplanung.'
            : 'Noch keine Vorgänge vorhanden. Füge zuerst Vorgänge in der Vorplanung hinzu.'
    } catch (error) {
        status.textContent = error.message
    }
})()
