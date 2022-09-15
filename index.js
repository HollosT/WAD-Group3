const express = require('express');
const app = express();

const env = require('dotenv').config();
const config = require('config');

const cors = require('cors');

const responseHeader = require('./middleware/responseHeaderJSOn')

// Routes variables
const tasks = require('./routes/tasks')
const login = require('./routes/login')
const accounts = require('./routes/accounts')


app.use(express.json());
const corsOptions = {
    exposedHeaders: ['x-authentication-token']
}
app.use(cors(corsOptions));
app.use(responseHeader)

app.use('/api/tasks', tasks)
app.use('/api/accounts/login', login)


app.listen(config.get('port'), () => console.log(`Listening on port: ${config.get('port')}...`));
