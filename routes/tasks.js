const express = require("express");
const { object } = require("joi");
const autheticate = require("../middleware/autheticate");
const router = express.Router();
const _ = require("lodash");

const Task = require("../models/task");
const Category = require("../models/category");
const Status = require("../models/status");

// Get all the tasks
router.get("/", async (req, res) => {
  try {
    // queries
    let taskSets = [];
    Object.keys(req.query).forEach((key) => {
      taskSets.push(new Set());
    });
    
    // if we have query parameters
    if (taskSets.length > 0) {
      const allTasks = await Task.readAll();

      allTasks.forEach((singleTask) => {
        for (let i = 0; i < taskSets.length; i++) {
          
          switch (Object.values(req.query)[i]) {
            case "outdoor":
              console.log('hello');
              if (
                singleTask.category.categoryname.includes(
                  req.query.categoryname
                )
              ) {
                taskSets[i].add(singleTask);
              }
              break;
            case "indoor":
              if (
                singleTask.category.categoryname.includes(
                  req.query.categoryname
                )
              ) {
                taskSets[i].add(singleTask);
              }
              break;
            default:
              break;
          }
        }
      });
      let tasks;
      if (taskSets.length == 1) {
        tasks = Array.from(taskSets[0]);
      }
     return res.send(JSON.stringify(tasks));
    } else {

      // all tasks
      const allTasks = await Task.readAll();
      return res.send(JSON.stringify(allTasks));
    }

  } catch (err) {
    if (err.statusCode){
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err)); // !!!!! Chrashes nodemon
  }
});

router.post("/", [autheticate], async (req, res) => {
  try {
    const { error } = Task.validate(req.body);
    if (error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: error,
      };
      
      const taskToBeSaved = new Task(req.body);
    const task = await taskToBeSaved.create();
    res.send(JSON.stringify(task));
  } catch (err) {
    if (err.statusCode)
      return res.status(err.statusCode).send(JSON.stringify(err));
  }
});

module.exports = router;
