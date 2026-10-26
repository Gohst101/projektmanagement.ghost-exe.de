function parseProjectData(value) {
    try {
        const data = typeof value === 'string' ? JSON.parse(value || '{}') : value
        const taskList = Array.isArray(data?.tasks) ? data.tasks : []
        const categories = Array.isArray(data?.categories) ? data.categories : []

        return {
            tasks: taskList.map((task, index) => ({
                id: String(task.position ?? task.id ?? index + 1),
                title: String(task.name ?? task.title ?? ''),
                days: Number.isFinite(Number(task.days)) ? Number(task.days) : 0,
                workers: Number.isFinite(Number(task.workers)) ? Number(task.workers) : 1,
                salary: Number.isFinite(Number(task.salary)) ? Number(task.salary) : 0,
                predecessor: Array.isArray(task.predecessor)
                    ? task.predecessor.map(String)
                    : typeof task.predecessor === 'string' && task.predecessor
                        ? task.predecessor.split(',').map(value => value.trim()).filter(Boolean)
                        : []
            })),
            categories: categories
                .filter(category => category && typeof category.title === 'string')
                .map(category => ({
                    title: category.title,
                    subcategories: Array.isArray(category.subcategories)
                        ? category.subcategories
                            .filter(subcategory => subcategory && typeof subcategory.title === 'string')
                            .map(subcategory => ({ title: subcategory.title }))
                        : []
                }))
        }
    } catch (error) {
        console.error('Invalid project data:', error)
        return { tasks: [], categories: [] }
    }
}

module.exports = { parseProjectData }
