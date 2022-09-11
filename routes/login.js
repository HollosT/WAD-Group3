const express = require('express');
const router = express.Router();

const Account = require('../models/account')

const jwt = require('jsonwebtoken');
const config = require('config');

router.post('/', async (req, res) => {
    res.header('Content-type', 'application/json');

    try{
        // Validate the req.body
        const {error } = Account.validateCredentials(req.body)
        if (error) throw { statusCode: 400, errorMessage: 'Badly formed request payload', errorObj: error }
        
        // check crendetials
        const account = await Account.checkCredentials(req.body)

        return res.send(JSON.stringify(account))
    }catch(err) {
        if (err.statusCode) return res.status(err.statusCode).send(JSON.stringify(err));
        return res.status(500).send(JSON.stringify(err));
    }
})

module.exports = router;