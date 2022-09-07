const Joi = require("joi");
const sql = require("mssql");

const config = require("config");
const con = config.get("dbConfig_UCN");

class Profile {
    constructor(profileObj) {
        this.profileid = profileObj.profileid;
        this.firstname = profileObj.email;
        this.lastname = profileObj.lastname;
        this.phonenumber = profileObj.phonenumber;
        this.description = profileObj.profiledescription;
        this.pictureurl = profileObj.profilepicture;
      }
    
      static validationSchema(profileObj){
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
            description: Joi.string()
            .max(255),
            profileurl: Joi.string()
            .uri(255),
        })
        return schema
      }
    
      static validate(profileObj) {
        const schema = Profile.validationSchema();
        return schema.validate(profileObj)
      }
}


module.exports = Profile;
