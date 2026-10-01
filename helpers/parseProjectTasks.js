function parseProjectTasks(tasksJson) {
    try {
        const parsedTasks = JSON.parse(tasksJson || '{}').tasks

        if (!Array.isArray(parsedTasks)) {
            return []
        }

        return parsedTasks.map(task => ({
            id: task.position ?? task.id ?? '',
            title: task.name ?? task.title ?? '',
            days: task.days ?? 0,
            predecessor: Array.isArray(task.predecessor) ? task.predecessor.join(', ') : task.predecessor || ''
        }))
    } catch (error) {
        console.error('Invalid project task data:', error)
        return []
    }
}

module.exports = { parseProjectTasks }