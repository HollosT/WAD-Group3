const express = require('express');
const app = express();

const env = require('dotenv').config();
const config = require('config');

const cors = require('cors');

const responseHeader = require('./middleware/responseHeaderJSOn')

// Routes variables
const tasks = require('./routes/tasks')
const login = require('./routes/login')


app.use(express.json());
app.use(cors());
app.use(responseHeader)

app.use('/api/tasks', tasks)
app.use('/api/accounts/login', login)


app.listen(config.get('port'), () => console.log(`Listening on port: ${config.get('port')}...`));
