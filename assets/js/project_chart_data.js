(() => {
    function readTasks(element) {
        try {
            const value = JSON.parse(element.dataset.projectTasks || '[]')
            if (!Array.isArray(value)) throw new Error('Die Vorgangsdaten haben ein ungültiges Format.')

            return value.map((task, index) => ({
                id: String(task.id ?? task.position ?? index + 1),
                title: String(task.title ?? task.name ?? `Vorgang ${index + 1}`),
                days: Number(task.days) || 0,
                workers: Number(task.workers) || 0,
                salary: Number(task.salary) || 0,
                predecessors: Array.isArray(task.predecessor)
                    ? task.predecessor.map(String)
                    : typeof task.predecessor === 'string'
                        ? task.predecessor.split(',').map(value => value.trim()).filter(Boolean)
                        : []
            }))
        } catch (error) {
            throw new Error(`Projektdaten konnten nicht gelesen werden: ${error.message}`)
        }
    }

    // Calculate early and late dates once so every project diagram uses identical logic.
    function schedule(tasks) {
        const byId = new Map(tasks.map(task => [task.id, task]))
        if (byId.size !== tasks.length) {
            throw new Error('Die Vorgänge enthalten doppelte Nummern.')
        }
        const successors = new Map(tasks.map(task => [task.id, []]))
        tasks.forEach(task => task.predecessors.forEach(predecessor => {
            if (!byId.has(predecessor)) {
                throw new Error(`Vorgänger ${predecessor} von Vorgang ${task.id} wurde nicht gefunden.`)
            }
            successors.get(predecessor).push(task.id)
        }))

        const visiting = new Set()
        const visited = new Set()
        const ordered = []

        function visit(id) {
            if (visiting.has(id)) throw new Error('Die Vorgänge enthalten einen Abhängigkeitskreis.')
            if (visited.has(id)) return

            visiting.add(id)
            byId.get(id).predecessors.forEach(visit)
            visiting.delete(id)
            visited.add(id)
            ordered.push(byId.get(id))
        }

        tasks.forEach(task => visit(task.id))
        ordered.forEach(task => {
            task.start = task.predecessors.reduce(
                (latest, predecessor) => Math.max(latest, byId.get(predecessor).finish),
                0
            )
            task.finish = task.start + task.days
            task.level = task.predecessors.reduce(
                (latest, predecessor) => Math.max(latest, byId.get(predecessor).level + 1),
                0
            )
        })

        const duration = Math.max(0, ...tasks.map(task => task.finish))
        ;[...ordered].reverse().forEach(task => {
            const nextTasks = successors.get(task.id)
            task.latestFinish = nextTasks.length
                ? Math.min(...nextTasks.map(id => byId.get(id).latestStart))
                : duration
            task.latestStart = task.latestFinish - task.days
            const calculatedSlack = task.latestStart - task.start
            task.slack = Math.max(0, calculatedSlack)
            task.critical = calculatedSlack < 0.000000001
        })

        return { tasks, duration, successors }
    }

    window.ProjectChartData = { readTasks, schedule }
})()
