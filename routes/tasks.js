const express = require("express");
const { object } = require("joi");
const router = express.Router();

const Task = require("../models/task");
// Get all the tasks
router.get("/", async (req, res) => {
  try {
    res.header("Content-type", "application/json");
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
            console.log(Object.values(req.query)[i]);
          switch (Object.values(req.query)[i]) {
            case "outdoor":
              if (
                singleTask.categoryArr[0].categoryname.includes(
                  req.query.categoryname
                  )
                  
              ) {
                // console.log(singleTask);
                taskSets[i].add(singleTask);
                // res.send(JSON.stringify(singleTask));
              }
              break;
            case "indoor":
              if (
                singleTask.categoryArr[0].categoryname.includes(
                  req.query.categoryname
                )
              ) {
                taskSets[i].add(singleTask);
                // res.send(JSON.stringify(singleTask));
              }
              break;
            default:
              break;
          }
        //   console.log(singleTask);
          //   console.log(taskSets);
        }
      });
      let tasks;
      if (taskSets.length == 1) {
        tasks = Array.from(taskSets[0]);
        // console.log(tasks)
      }
      res.send(JSON.stringify(tasks));
    }

    // all tasks
    const allTasks = await Task.readAll();
    res.send(JSON.stringify(allTasks));
  } catch (err) {
    if (err.statusCode)return res.status(err.statusCode).send(JSON.stringify(err));
    // return res.status(500).send(JSON.stringify(err));
  }
});

module.exports = router;
