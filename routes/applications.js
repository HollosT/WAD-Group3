const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Joi = require('joi');
const autheticate = require('../middleware/autheticate');
const Application = require('../models/application')
const Task = require('../models/task')
const Account = require('../models/account')

router.post('/', [autheticate], async (req, res) => {
    try {

        const { error } = Application.validate(req.body);
        if (error)
          throw {
            statusCode: 400,
            errorMessage: `Badly formatted request`,
            errorObj: error,
          };
    
        const applicationToBeSaved = new Application(req.body);
        const application = await applicationToBeSaved.createApplication();
        res.send(JSON.stringify(application));
      } catch (err) {
        if (err.statusCode)
          return res.status(err.statusCode).send(JSON.stringify(err));
      }
})


module.exports = router