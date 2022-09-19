const Joi = require('joi');
const sql = require('mssql');

const config = require('config');
const con = config.get('dbConfig_UCN');
const _ = require('lodash')

const Status = require('./status');
const Category = require('./category')
const Account = require('./account');
const Profile = require('./profile');
const { max } = require('lodash');

class Task {
    constructor(taskObj) {
        if (taskObj.taskid) {
            this.taskid = taskObj.taskid;
        }
        this.tasktitle = taskObj.tasktitle;
        this.taskdescription = taskObj.taskdescription;
        this.taskaddress = taskObj.taskaddress;
        this.taskpostdate = taskObj.taskpostdate;
        this.tasksalary = taskObj.tasksalary;
        if (taskObj.profile) {
            this.profile = {
                profileid: taskObj.profile.profileid,
                firstname: taskObj.profile.firstname,
                lastname: taskObj.profile.lastname,
                phonenumber: taskObj.profile.phonenumber
            }
        }
        if (taskObj.account) {
            this.account = {
                accountid: taskObj.account.accountid
            }
        }

        if (taskObj.category) {
            this.category = {
                categoryid: taskObj.category.categoryid,
                categoryname: taskObj.category.categoryname
            }
        }

        if (taskObj.status) {
            this.status = {
                statusid: taskObj.status.statusid,
                statusname: taskObj.status.statusname
            }
        }

    
        // this.accountArr = _.cloneDeep(taskObj.accountArr);
        // this.statusArr = _.cloneDeep(taskObj.statusArr);
        // this.categoryArr = _.cloneDeep(taskObj.categoryArr);
    }
  
    static validationSchema() {
        const schema = Joi.object({
            taskid: Joi.number()
                .integer()
                .min(1),
            tasktitle: Joi.string()
                .max(50)
                .required(),
            taskdescription: Joi.string()
                .max(255)
                .required(),
            taskaddress: Joi.string()
                .max(255)
                .required(),
            taskpostdate: Joi.number()
                .integer()
                .required(),
            tasksalary: Joi.number()
                .integer()
                .required(),

            profile: Joi.object({
                profileid: Joi.number()
                    .integer()
                    .min(1)
                    .required(),
                firstname: Joi.string()
                    .required(),
                lastname: Joi.string()
                    .required(),
                phonenumber: Joi.string()
                    .required()
                    .max(255)
            }),

            account: Joi.object({
                accountid: Joi.number()
                    .integer()
                    .required()
                    .min(1)
            }),

            status: Joi.object({
                statusid: Joi.number()
                    .integer()
                    .required()
                    .min(1),
                statusname: Joi.string()
            }),

            category: Joi.object({
                categoryid: Joi.number()
                    .integer()
                    .required()
                    .min(1),
                categoryname: Joi.string()
            })

            // profileArr: Joi.array().items(Profile.validationSchema()),
            // accountArr: Joi.array().items(Account.validationSchema()),
            // statusArr: Joi.array().items(Status.validationSchema()),
            // categoryArr: Joi.array().items(Category.validationSchema()),
        })
        
        return schema;
    }

    static validate(taskObj) {
        const schema = Task.validationSchema();
        return schema.validate(taskObj)
    }

    // Get all the tasks
    static readAll() {
        return new Promise((resolve, reject) => {

            (async () => {
                try {
                    const pool = await sql.connect(con)

                    // we want to get everything from a job task
                    // join task with account
                    // join profile with account
                    // join task with status
                    // join task with category

                    const result = await pool.request().query(
                        `
                        SELECT * 
                        FROM jobTask t
                            INNER JOIN jobAccount a 
                            ON t.FK_accountid = a.accountid
                                INNER JOIN jobProfile p
                                ON a.FK_profileid = p.profileid
                            INNER JOIN jobStatus s
                            ON t.FK_statusid = s.statusid
                            INNER JOIN jobCategory c
                            ON t.FK_categoryid = c.categoryid        

                        ORDER BY t.taskid
                        `
                    );

                    const tasksCollection = [];
                    result.recordset.forEach((record) => {
                        const newTask = {
                            taskid: record.taskid,
                            tasktitle: record.tasktitle,
                            taskdescription: record.taskdescription,
                            taskaddress: record.taskaddress,
                            taskpostdate: record.taskpostdate,
                            tasksalary: record.tasksalary,
                            profile: {
                                profileid: record.profileid,
                                firstname: record.firstname,
                                lastname: record.lastname,
                                phonenumber: record.phonenumber
                            },
                            account: {
                                accountid: record.accountid
                            },

                            category: {
                                categoryid: record.categoryid,
                                categoryname: record.categoryname
                            },

                            status: {
                                statusid: record.statusid,
                                statusname: record.statusname,
                            }
                            
                            // profileArr: [
                            //     {
                            //         profileid: record.profileid,
                            //         firstname: record.firstname,
                            //         lastname: record.lastname,
                            //         phonenumber: record.phonenumber
                            //     }
                            // ],
                            // accountArr: [
                            //     {
                            //         accountid: record.accountid,
                            //         email: record.email
                            //     }
                            // ],
                            // statusArr: [
                            //     {
                            //         statusid: record.statusid,
                            //         statusname: record.statusname,
                            //     }
                            // ],
                            // categoryArr: [
                            //     {
                            //         categoryid: record.categoryid,
                            //         categoryname: record.categoryname,
                            //     }
                            // ]
                        }
                        tasksCollection.push(newTask)
                    });

                    // validation
                    const tasks = [];
                    tasksCollection.forEach((task) => {
                        
                        const { error } = Task.validate(task);
                        
                        if (error)
                            throw {
                                statusCode: 500,
                                errorMessage: `Corrupt task information in the database, taskid: ${task.taskid}`,
                                errorObj: error,
                            };

                        tasks.push(new Task(task));
                    })

                    resolve(tasks)

                } catch (err) {
                    reject(err);
                }
                sql.close();
            })();
        })
    }

    // static readCategory() {
    //     return new Promise((resolve, reject) => {
    //         (async () => {
    //             try {

    //             } catch (err) {

    //             }
    //         })();
    //     })
    // }
    // queries 
    // after opening the database join task table and catrgory table


    // Creating task
    create () {
        return new Promise((resolve, reject) => {
            (async () => {
                try {

                    const pool = await sql.connect(con);
                    const result = await pool.request()
                    .input('tasktitle', sql.NVarChar(), this.tasktitle)
                    .input('taskdescription', sql.NVarChar(), this.taskdescription)
                    .input('taskaddress', sql.NVarChar(), this.taskaddress)
                    .input('taskpostdate', sql.BigInt(), this.taskpostdate)
                    .input('tasksalary', sql.Int(), this.tasksalary)
                    .input('accountid', sql.Int(), this.account.accountid)
                    .input('categoryid', sql.Int(), this.category.categoryid)
                    .query(`
                    INSERT INTO jobTask 
                    ([tasktitle], [taskdescription], [taskaddress], [taskpostdate], [tasksalary], [FK_accountid], [FK_categoryid])
                    VALUES 
                    (@tasktitle, @taskdescription, @taskaddress, @taskpostdate, @tasksalary, @accountid, @categoryid);
                    SELECT *
                    FROM jobTask t
                    WHERE t.taskid = SCOPE_IDENTITY()
                    `)
                
                   
                    // two tables - task and category
                    if (result.recordset.length != 1) throw{statusCode: 500, errorMessage: 'INSERT INTO account table is failed', errorObj: {}}

                    const task = await result.recordset[0]
                    resolve(task)

                } catch (err) {
                    reject(err)
                }
                sql.close();
            })();
        })

    }
}

module.exports = Task;