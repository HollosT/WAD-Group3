const Joi = require("joi");
const sql = require("mssql");

const config = require("config");
const con = config.get("dbConfig_UCN");
const bcrypt = require('bcryptjs')

class Account {
    constructor(accountObj) {
      if(accountObj.accountid) {
        this.accountid = accountObj.accountid;
      }
        this.email = accountObj.email;
          this.profileid = accountObj.profileid;
        this.role = {
          roleid: accountObj.role.roleid
        }
        if(accountObj.role.rolename) {
          this.role.rolename = accountObj.role.rolename
        }
      }
    
      static validationSchema(){
        const schema = Joi.object({
            accountid: Joi.number()
            .integer()
            .min(1),
            email: Joi.string()
            .email()
            .max(255)
            .required(),
            profileid: Joi.number()
            .integer()
            .min(1),
            role: Joi.object({
              roleid: Joi.number()
              .integer()
              .min(1)
              .required(),
              rolename: Joi.string()
              .max(50)
            })
            .required()
        })
        return schema
      }
    
      static validate(accountObj) {
        const schema = Account.validationSchema();
        return schema.validate(accountObj)
      }

      static validateCredentials(credentialsObj) {
        const schema = Joi.object({
            email: Joi.string()
                .email()
                .max(255)
                .required(),
            password: Joi.string()
                .required()
        })

        return schema.validate(credentialsObj);
    }

      static checkCredentials(credentialObj) {
        return new Promise((resolve, reject) => {
          (async () => {
            try{
              const account = await Account.readByEmail(credentialObj.email)
              const pool = await sql.connect(con);
              const result = await pool.request()
              .input('accountid', sql.Int(), account.accountid)
              .query(`
              SELECT *
              FROM jobPassword p
              WHERE p.FK_accountid = @accountid
              `)
              
              if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt DB.`, errorObj: {} }
              
              const hashedPassword = result.recordset[0].hashedpassword;

              
              const okCredentials = bcrypt.compareSync(credentialObj.password, hashedPassword);
              if(!okCredentials) throw {statusCode: 401}

              resolve(account)
            } catch(err) {
              if (err.statusCode) reject({ statusCode: 401, errorMessage: `Invalid email or password`, errorObj: {} })
              reject(err)
            }
            sql.close()
          })()
        })
      }

      static readByEmail(email){

        return new Promise((resolve, reject) => {
          (async () => {
            try{

              const pool = await sql.connect(con);
              const result = await pool.request()
                .input('email', sql.NVarChar(), email)
                .query(`
                      SELECT *
                      FROM jobAccount a
                      INNER JOIN jobRole r
                      ON a.FK_roleid = r.roleid
                      WHERE a.email = @email
                `)
                if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Account not found.`, errorObj: {} }
                if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt information in DB`, errorObj: {} }
                
                const firstResult = result.recordset[0];
                
                // structuring the DB response
                const almostAccount = {
                  accountid: firstResult.accountid,
                  email: firstResult.email,
                  profileid: firstResult.FK_profileid,
                  role: {
                    roleid: firstResult.roleid,
                    rolename: firstResult.rolename
                  }
                }

                const {error} = Account.validate(almostAccount);
                if(error) throw {statusCode: 500, errorMessage: `Corrupt account information in the database, accountid: ${almostAccount.accountid}`, errorObj:error}


                resolve(new Account(almostAccount))
            }catch(err) {
              reject(err)
            }
            sql.close();
          })()
        })
      }

}


module.exports = Account;