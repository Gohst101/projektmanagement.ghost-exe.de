const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../middleware/requireAuth.js')
const { parseProjectTasks } = require('../helpers/parseProjectTasks.js')
const pool = require('../../database/connection/connection.js')
const task = require('../../database/queries/task.js'[req.session.user.userId, projectId])


// cost_chart_1_creation
async function createCostChart1(req, res) {
    //
    const Canvas1 = require('cost-chart-workers');
    const ctx1 = Canvas1.getContext('2d');
    const { chartData } = req.body;

    const chart = new Canvas1.Chart(ctx1, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
        }
    });
}
// cost_chart_2_creation
async function createCostChart2(req, res) {
    //
    const Canvas2 = require('cost-chart');
    const ctx2 = Canvas2.getContext('2d');
    const { chartData } = req.body;

    const chart = new Canvas2.Chart(ctx2, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
        }
    });
}