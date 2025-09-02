const express = require('express');
const dotenv = require('dotenv');
const {connectDB} = require('./config/db')
const emailRoute = require('./routes/emailRoute')
dotenv.config({path:'./config/config.env'});

connectDB()

const app = express();

app.use('/api/v1/auth',emailRoute)

const PORT = process.env.PORT || 5000;
app.listen(PORT,console.log('Server running in', process.env.NODE_ENV, 'mode on port', PORT));