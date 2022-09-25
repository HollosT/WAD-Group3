const Joi = require("joi");
const sql = require("mssql");

const config = require("config");
const Task = require("./task");
const Account = require("./account");
const con = config.get("dbConfig_UCN");

class Application {
    constructor(applicationObj) {
        this.taskid = applicationObj.taskid;
        this.account = {
            accountid: applicationObj.account.accountid,
            email: applicationObj.account.email
        }
    }

    static validationSchema(){
        const schema = Joi.object({
            taskid: Joi.number()
            .integer()
            .min(1),
            account: Joi.object({
                accountid:Joi.number()
                .integer()
                .min(1),
                email: Joi.string()
                .email()
            })
            
        })
        return schema
      }
    
      static validate(applicationObj) {
        const schema = Application.validationSchema();
        return schema.validate(applicationObj)
      }

    static checkApplication(taskid, accountid) {
        return new Promise((resolve, reject) => {
            (async () => {
                try{

                    const pool = await sql.connect(con)
                    const result = await pool.request()
                        .input('taskid', sql.Int(), taskid)
                        .input('accountid', sql.Int(), accountid)
                        .query(`
                            SELECT *
                            FROM jobApplication a
                            WHERE a.FK_taskid = @taskid
                            AND a.FK_accountid = @accountid
                        `)
                        
                        if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple authors with taskid: ${taskid} and accountid: ${accountid}`, errorObj: {} };
                        if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Task has not been applied yet by accountid: ${accountid}`, errorObj: {} };

                    const applicationWannabe = {
                        taskid: result.recordset[0].taskid,
                        account: {
                            accountid: result.recordset[0].accountid
                        }
                    }
                    const {error} = Application.validate(applicationWannabe)
                    if(error) throw {statusCode: 500, errorMessage: `Corrupt DB, application does not validate`, errorObj: error}
                    
                    resolve(new Application(applicationWannabe))
                }catch(err) {
                    reject(err)
                }
            sql.close()
            })();
        })
      }


     createApplication() {
        return new Promise ((resolve, reject) => {
            (async () => {
                try{
                    // we check the task and the account whether they exist
                    try {
                        const account = await Account.readByEmail(this.account.email)
                        if(!account) throw {statusCode: 409, errorMessage: `Account with this email address: ${this.account.email} does not exist`, errorObj: {}}
                        
                        const task = await Task.readByTaskId(this.taskid)
                        if(task.account.accountid == this.account.accountid) throw {statusCode: 500, errorMessage: `You can not apply for your own task!`, errorObj: {}}
                        if(!task) throw {statusCode: 409, errorMessage: `Task with taskid: ${this.taskid} does not exist`, errorObj: {}}
                        
                    }catch(err) {
                        if(err.statusCode) {
                            reject (err);
                        }
                    }
                    
                    // check whether they have already applied
                    try{
                        const application = await Application.checkApplication(this.taskid, this.account.accountid)
                        
                        const error = {statusCode: 409, errorMessage: `You already applied!`, errorObj: {}}
                        return reject (error);
                    }catch(err) {
                        if(!err.statusCode || err.statusCode != 404) {
                            reject(err);
                          }
                    }

                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('taskid', sql.Int(), this.taskid)
                        .input('accountid', sql.Int(), this.account.accountid)
                        .query(`
                            INSERT INTO jobApplication
                                ([FK_taskid], [FK_accountid])
                            VALUES
                                (@taskid, @accountid)
                            SELECT *
                            FROM jobApplication a
        
                        `)
                        //  INNER JOIN jobTask t
                        // ON ap.FK_taskid = t.taskid
                        // INNER JOIN jobAccount a
                        // ON ap.FK_accountid = a.accountid
                    // if(result.recordset.length != 1) throw{statusCode: 500, errorMessage: 'INSERT into Application table failed', errorObj: {}}

                    // const application = await result.recordset[result.recordset.length -1].FK_authorid;
                    const last= result.recordset[result.recordset.length -1];
                    const applicationWannabe = {
                        taskid: last.FK_taskid,
                        account:{
                            accountid: last.FK_accountid,
                        } 
                    }   
                    console.log(applicationWannabe);
                    const { error } = Application.validate(applicationWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, task does not validate: ${applicationWannabe.taskid}`, errorObj: error };
                    console.log(new Application(applicationWannabe));
                    
                    resolve(applicationWannabe);

                }catch(err) {
                    reject(err)
                }
                sql.close()
            })();
        })
      }

}

module.exports = Application