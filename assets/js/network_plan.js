(() => {
    const page = document.querySelector('[data-network-plan]')
    if (!page) return

    const canvas = page.querySelector('[data-network-canvas]')
    const nodesContainer = canvas.querySelector('.network-plan-nodes')
    const edgeSvg = canvas.querySelector('.network-plan-edges')
    const status = page.querySelector('[data-chart-status]')

    // Keep task labels in text nodes so project names are never interpreted as markup.
    function createNode(task, x, y) {
        const node = document.createElement('article')
        node.className = `network-node${task.critical ? ' critical' : ''}`
        node.dataset.nodeId = task.id
        node.style.left = `${x}px`
        node.style.top = `${y}px`

        const heading = document.createElement('h2')
        heading.textContent = `${task.id}. ${task.title}`

        const duration = document.createElement('p')
        duration.textContent = `Dauer: ${task.days} ${task.days === 1 ? 'Tag' : 'Tage'}`

        const dates = document.createElement('dl')
        const dateValues = [
            ['FAZ', task.start],
            ['FEZ', task.finish],
            ['SAZ', task.latestStart],
            ['SEZ', task.latestFinish],
            ['Puffer', task.slack]
        ]
        dateValues.forEach(([label, value]) => {
            const term = document.createElement('dt')
            term.textContent = label
            const description = document.createElement('dd')
            description.textContent = String(value)
            dates.append(term, description)
        })
        node.append(heading, duration, dates)
        return node
    }

    function drawDependency(from, to, critical) {
        const startX = from.x + 204
        const startY = from.y + 72
        const endX = to.x
        const endY = to.y + 72
        const curve = Math.max(32, (endX - startX) / 2)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`)
        path.setAttribute('class', critical ? 'network-edge critical' : 'network-edge')
        path.setAttribute('marker-end', `url(#${critical ? 'network-arrow-critical' : 'network-arrow'})`)
        edgeSvg.append(path)
    }

    try {
        const result = window.ProjectChartData.schedule(window.ProjectChartData.readTasks(page))
        if (result.tasks.length === 0) {
            status.textContent = 'Noch keine Vorgänge vorhanden. Füge zuerst Vorgänge in der Vorplanung hinzu.'
            return
        }

        const levels = new Map()
        // Group tasks by dependency depth to keep every predecessor left of its successors.
        result.tasks.forEach(task => {
            if (!levels.has(task.level)) levels.set(task.level, [])
            levels.get(task.level).push(task)
        })
        const positions = new Map()
        const definitions = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        ;[['network-arrow', '#7c8da4'], ['network-arrow-critical', '#ed5a5a']].forEach(([id, color]) => {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
            marker.setAttribute('id', id)
            marker.setAttribute('viewBox', '0 0 10 10')
            marker.setAttribute('refX', '9')
            marker.setAttribute('refY', '5')
            marker.setAttribute('markerWidth', '6')
            marker.setAttribute('markerHeight', '6')
            marker.setAttribute('orient', 'auto-start-reverse')
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            arrow.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
            arrow.setAttribute('fill', color)
            marker.append(arrow)
            definitions.append(marker)
        })
        edgeSvg.append(definitions)

        let maxRows = 1
        levels.forEach((tasks, level) => {
            maxRows = Math.max(maxRows, tasks.length)
            tasks.forEach((task, row) => {
                const position = { x: 24 + level * 280, y: 24 + row * 176 }
                positions.set(task.id, position)
                nodesContainer.append(createNode(task, position.x, position.y))
            })
        })

        const width = 48 + (Math.max(...levels.keys()) + 1) * 280
        const height = 48 + maxRows * 176
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        edgeSvg.setAttribute('viewBox', `0 0 ${width} ${height}`)
        edgeSvg.setAttribute('width', String(width))
        edgeSvg.setAttribute('height', String(height))

        result.tasks.forEach(task => task.predecessors.forEach(predecessorId => {
            const from = positions.get(predecessorId)
            const to = positions.get(task.id)
            const predecessor = result.tasks.find(item => item.id === predecessorId)
            drawDependency(from, to, predecessor.critical && task.critical)
        }))

        status.textContent = `Projektdauer: ${result.duration} ${result.duration === 1 ? 'Tag' : 'Tage'}.`
    } catch (error) {
        status.textContent = error.message
    }
})()
