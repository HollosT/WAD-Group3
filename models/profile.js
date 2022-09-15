const Joi = require("joi");
const sql = require("mssql");

const config = require("config");
const con = config.get("dbConfig_UCN");

class Profile {
    constructor(profileObj) {
        this.profileid = profileObj.profileid;
        this.firstname = profileObj.firstname;
        this.lastname = profileObj.lastname;
        this.phonenumber = profileObj.phonenumber;
        this.profiledescription = profileObj.profiledescription;
        this.profilepicture = profileObj.profilepicture;
      }
    
      static validationSchema(){
        const schema = Joi.object({
            profileid: Joi.number()
            .integer()
            .min(1),
            firstname: Joi.string()
            .max(50)
            .required(),
            lastname: Joi.string()
            .max(50)
            .required(),
            phonenumber: Joi.number()
            .integer()
            .required(),
            profiledescription: Joi.string()
            .max(255),
            profilepicture: Joi.string()
            .uri()
            .max(255)
        })
        return schema
      }
    
      static validate(profileObj) {
        const schema = Profile.validationSchema();
        return schema.validate(profileObj)
      }

      // Getting the profile by phonenumber
      static readByPhoneNumber(phoneNumber) {
        return new Promise((resolve, reject) => {
          (async () => {
            try{
              const pool = await sql.connect(con);
              const result = await pool.request()
              .input('phonenumber', sql.NVarChar(), phoneNumber)
              .query(`
                    SELECT *
                    FROM jobProfile p
                    WHERE p.phonenumber = @phonenumber
              `)

              if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Account not found.`, errorObj: {} }
              if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt information in DB`, errorObj: {} }

              // structuring the DB response
              const firstResult = result.recordset[0];
              const almostProfile = {
                profileid: firstResult.profileid,
                phonenumber: firstResult.phonenumber,
                firstname: firstResult.firstname,
                lastname: firstResult.lastname
              }

              const {error} = Profile.validate(almostProfile);
              if (error) throw {statusCode: 500, errorMessage: `Corrupt account information in the database, accountid: ${almostAccount.accountid}`, errorObj: error}

              resolve(new Profile(almostProfile))
            }catch(err) {
              reject(err)
            }
            sql.close()
          })();
        })
      }
}


module.exports = Profile;
