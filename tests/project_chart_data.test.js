const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

// Load the browser scheduling helper in an isolated window-like context.
const chartWindow = {}
const scriptPath = path.join(__dirname, '..', 'assets', 'js', 'project_chart_data.js')
vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), { window: chartWindow })
const { schedule } = chartWindow.ProjectChartData

test('computes earliest dates and identifies the critical path', () => {
    const result = schedule([
        { id: '1', title: 'Start', days: 3, predecessors: [] },
        { id: '2', title: 'Long branch', days: 2, predecessors: ['1'] },
        { id: '3', title: 'Short branch', days: 1, predecessors: ['1'] },
        { id: '4', title: 'Finish', days: 2, predecessors: ['2', '3'] }
    ])

    assert.equal(result.duration, 7)
    assert.equal(result.tasks.find(task => task.id === '3').slack, 1)
    assert.deepEqual(
        result.tasks.filter(task => task.critical).map(task => task.id),
        ['1', '2', '4']
    )
})

test('marks only the longest independent task as critical', () => {
    const result = schedule([
        { id: '1', title: 'Short', days: 2, predecessors: [] },
        { id: '2', title: 'Long', days: 5, predecessors: [] }
    ])

    assert.equal(result.duration, 5)
    assert.equal(result.tasks.find(task => task.id === '1').slack, 3)
    assert.equal(result.tasks.find(task => task.id === '2').critical, true)
})

test('rejects missing predecessors, duplicate IDs, and dependency cycles', () => {
    assert.throws(
        () => schedule([{ id: '1', title: 'Missing', days: 1, predecessors: ['9'] }]),
        /wurde nicht gefunden/
    )
    assert.throws(
        () => schedule([
            { id: '1', title: 'First', days: 1, predecessors: [] },
            { id: '1', title: 'Duplicate', days: 1, predecessors: [] }
        ]),
        /doppelte Nummern/
    )
    assert.throws(
        () => schedule([
            { id: '1', title: 'First', days: 1, predecessors: ['2'] },
            { id: '2', title: 'Second', days: 1, predecessors: ['1'] }
        ]),
        /Abhängigkeitskreis/
    )
})
