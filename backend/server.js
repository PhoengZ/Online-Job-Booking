const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const {connectDB} = require('./config/db');
const cors = require('cors')
dotenv.config({path:'./config/config.env'});

//Connect to DB
connectDB()

const app = express();

//Body Parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());
app.use(cors())

//Route File
const auth = require("./routes/auth");
const booking = require("./routes/booking");
const company = require("./routes/company");
const favoirting = require('./routes/favoriting')

app.use('/api/v1/auth',auth);
app.use('/api/v1/booking',booking);
app.use('/api/v1/companies',company);
const PORT = process.env.PORT || 5000;
app.listen(PORT,console.log('Server running in', process.env.NODE_ENV, 'mode on port', PORT));

process.on('unhandledRejection',(err,promise) => {
    console.log(`Error: ${err.message}`);
    //close server and exit process if have error
    server.close(()=>process.exit(1));
});
