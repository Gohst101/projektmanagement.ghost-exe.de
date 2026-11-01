const { parseProjectData } = require('./parseProjectData.js')

// Keep the existing task-only API while sharing tolerant legacy-data parsing.
function parseProjectTasks(tasksJson) {
    return parseProjectData(tasksJson).tasks.map(task => ({
        id: task.id,
        title: task.title,
        days: task.days,
        workers: task.workers,
        salary: task.salary,
        predecessor: task.predecessor.join(', ')
    }))
}

module.exports = { parseProjectTasks }
