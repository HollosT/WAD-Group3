const express = require('express');
const router = express.Router();

const Task = require('../models/task')
// Get all the tasks
router.get('/', async (req, res) => {
    res.header("Content-type", "application/json");
   try{
        const tasks = await Task.readAll()

        res.send(JSON.stringify(tasks));

    } catch(err) {
        if (err.statusCode) return res.status(err.statusCode).send(JSON.stringify(err))
        return res.status(500).send(JSON.stringify(err));
    }
})



module.exports = router;