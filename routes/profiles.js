const express = require('express');
const router = express.Router();
const autheticate = require("../middleware/autheticate");
const Profile = require('../models/profile')

const jwt = require('jsonwebtoken');
const config = require('config');


router.get('/:profileid', [autheticate], async (req,res) =>{
    try{
        const profile = await Profile.readByProfileid(req.params.profileid)

        res.send(JSON.stringify(profile))

    }catch(err) {
        if(err.statusCode) {
            return res.status(err.statusCode).send(JSON.stringify(err));
            
        }
        return res.status(500).send(JSON.stringify(err));
    }

})

module.exports = router;