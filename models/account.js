const Joi = require("joi");
const sql = require("mssql");

const config = require("config");
const con = config.get("dbConfig_UCN");

class Account {
    constructor(accountObj) {
        this.accountid = accountObj.accountid;
        this.email = accountObj.email;
      }
    
      static validationSchema(){
        const schema = Joi.object({
            accountid: Joi.number()
            .integer()
            .min(1),
            email: Joi.email()
            .max(255)
            .required()
        })
        return schema
      }
    
      static validate(accountObj) {
        const schema = Account.validationSchema();
        return schema.validate(accountObj)
      }
}


module.exports = Account;