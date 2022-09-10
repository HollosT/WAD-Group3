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
}


module.exports = Profile;
