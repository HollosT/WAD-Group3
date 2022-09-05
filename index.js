const express = require('express');
const app = express();

const env = require('dotenv').config();
const config = require('config');

const cors = require('cors');

// Routes variables
const tasks = require('./routes/tasks')


app.use(express.json());
app.use(cors());
app.use('/api/tasks', tasks)


app.listen(config.get('port'), () => console.log(`Listening on port: ${config.get('port')}...`));
