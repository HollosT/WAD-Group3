const Joi = require('joi');
const sql = require('mssql');

const config = require('config');
const con = config.get('dbConfig_UCN');

class Task {
    constructor(taskObj) {
        if(taskObj.taskid) {
            this.taskid = taskObj.taskid;
        }
        this.tasktitle = taskObj.tasktitle;
        this.taskdescription = taskObj.taskdescription;
    }

    static readAll() {
        return new Promise((resolve, reject) => {
            (async () => {
               try { 
                    const pool = await sql.connect(con)
                    const result = await pool.request().query(
                        `
                        SELECT * 
                        FROM jobTask t
                        ORDER BY t.taskid
                        `
                    );
                    
                    const tasks = [];

                    result.recordset.forEach((record) => {
                        const task = {
                            taskid: record.taskid,
                            tasktitle: record.tasktitle,
                            taskdescription: record.taskdescription

                        }
                        tasks.push(new Task(task))
                    })

                    resolve(tasks)

                } catch(err) {
                    reject(err);
                }
                sql.close();
            })();
        }) 
    }


}

module.exports = Task;