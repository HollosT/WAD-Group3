const express = require("express");
const { object } = require("joi");
const router = express.Router();

const Task = require("../models/task");
// Get all the tasks
router.get("/", async (req, res) => {
  res.header("Content-type", "application/json");
  try {
    // queries
    let taskSets = [];
    Object.keys(req.query).forEach((key) => {
      taskSets.push(new Set());
    });

    // console.log(req.query);

    // if we have query parameters
    if (taskSets.length > 0) {
      const allTasks = await Task.readAll();
      //   console.log(allTasks);

      allTasks.forEach((singleTask) => {
        //   console.log(taskSets);
        console.log(req.query.categoryname);
        for (let i = 0; i < taskSets.length; i++) {
          //   console.log(singleTask);
          switch (Object.keys(req.query)[i]) {
            case "outdoor":
              if (
                singleTask.categoryArr[0].categoryname.includes(
                  req.query.categoryname
                )
              ) {
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
          console.log(taskSets);
        }
      });
      let tasks;
      if (taskSets.length == 1) {
        tasks = Array.from(taskSets[0]);
      }
      res.send(JSON.stringify(tasks));
    }

    // all tasks
    // const tasks = await Task.readAll();
  } catch (err) {
    if (err.statusCode)
      return res.status(err.statusCode).send(JSON.stringify(err));
    return res.status(500).send(JSON.stringify(err));
  }
});

module.exports = router;
