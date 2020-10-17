require('dotenv').load();
// Modules =================================================
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const logger = require('./server/log/logger');
const fs = require('fs');
const  helmet = require('helmet');
const formidable = require('express-formidable');
//MAIN Env. variables, needed to the project to run
const node_env = process.env.NODE_ENV;
const DB_SECRET = process.env.DB_SECRET;
const DB_PRODUCTION = process.env.DB_PRODUCTION;
const mongoose = require('mongoose');
const Utils = require('./server/mongodb/accesses/utils-accesses');

// Configuration ===========================================
let appConfig = require('./config/app');
let port = process.env.PORT || appConfig.ports[node_env];
let dbConfig = require('./config/db');



mongoose.connect(dbConfig.urls[node_env], { useNewUrlParser: true, keepAlive: 1, connectTimeoutMS: 30000,
    keepAlive: 1, connectTimeoutMS: 30000 });

mongoose.connection.on("connected", () => {
    logger.info("Connected to MongoDB on " + dbConfig.urls[node_env]);
});
mongoose.connection.on("error", (dbError) => {
    logger.error("Could not connect to database on: " + dbConfig.urls[node_env]);
    throw new Error(dbError);
});
mongoose.set('useCreateIndex', true);





const NODE_ENV_ERROR =
  "[ERROR] - NODE_ENV not set.\n" +
  "Define it on your environment variables.";

if (!node_env) {
    return console.error(NODE_ENV_ERROR);
}

logger.info("NODE_ENV = " + node_env);
if (DB_SECRET)  {
    logger.info("DB_SECRET IS " + "DEFINED");
}   else    {
    logger.warn("DB_SECRET IS NOT " + "NOT DEFINED");
}

if(!DB_PRODUCTION && node_env === "production") {
    console.error("Production DB not set. Please export the environment variable");
}


//Initialize app
const app = express();
// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);


// enable CORS without external module
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Length, Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', '*');
//  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
// res.header("Access-Control-Allow-Credentials", "true");
    if ('OPTIONS' === req.method) {
        //respond with 200
    }
    next();
});




app.use(formidable());

//Summarized version, output goes to console
app.use(morgan('dev'));

//Full log to file
app.use((morgan)("common", {stream: logger.stream}));

// Security ===========================================
//Defaults:
helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com']
    }
});

app.use(helmet({
}));

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));


// Routes
require('./server/routes')(app, __dirname);

process.on('uncaughtException', (err) => {
    switch(err.errno)   {
        case "EADDRINUSE":
            logger.error("Address in use. Port: being used:" + port);
            break;
        default:
            fs.writeSync(1, `Caught exception: ${err}\n`);
            logger.error("Process terminating: \n");
            logger.error(err);
    }
    process.exit();
});

//We use Heroku, so we delegate SSL implementation to Heroku's load balancer.

app.listen(port, () => {
        logger.info("Server running on port: " + port);
        logger.warn("Server running since: " + new Date());
});

