const DBAccess = require('./../mongodb/accesses/mongo-access');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dbConfig = require('../../config/db');
const Utils = require('../mongodb/accesses/utils-accesses');
const UtilsRoutes = require('../routes/utils-routes');
const Iam = require('../routes/iam');
const ba_logger = require('../log/ba_logger');
const passport = require('passport');
const NtuaAPI = require('../ntua-api/ntua');
require('dotenv').load();
const DB_SECRET = process.env.DB_SECRET;

const USER_NOT_FOUND = "User not found.";
const WRONG_PASSWORD_PART_1 = "Wrong password. You have ";
const WRONG_PASSWORD_PART_2 = " remaining attempts.";
const WRONG_PASSWORD_INVALIDATE = "Your account has been blocked";
const USER_INVALID = "";
const USER_UNCONFIRMED = "Confirm your account";
const COMP_ADDED = "Company added";
const NOT_COMP = "Not a company";
const DUP_ENTRY = "Company already exists";
const ERROR = "An error concerning DB has occurred.";
const COMPANY_UPDATED = "Company has been updated.";

/*
router.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
});*/

router.options("/*", function(req, res, next){
    console.log("Options")
    next();
});

//Registers a recruiter. Only users with the role "administrator" can do so.
router.post('/register', passport.authenticate('jwt', {session: false}), function (req, res) {
    if(!Iam.isAdministrator(req))    {
        UtilsRoutes.replyFailure(res,"Only recruiters can access this route",'');
        return;
    }
    let name = req.fields.name;
    let email = req.fields.email;
    let password = req.fields.password;
    let description = req.fields.description;
    let location = req.fields.location;
    let contact = req.fields.contact;

    DBAccess.recruiter.addRecruiter(name, email, password, description,location,contact, (err, addedCompany) => {
        if (err)  {
            if (err.name === 'MongoError' && err.code === 11000)    {
                //Duplicated username or contact
                return UtilsRoutes.replyFailure(res,err,DUP_ENTRY);
            } else  {
                return UtilsRoutes.replyFailure(res,err,ERROR);
            }
        }  else {
            ba_logger.ba("Recruiter:"+ name + ":" + "registered");
            return UtilsRoutes.replySuccess(res,addedCompany,COMP_ADDED);
        }
    });
});

//Logins a user and returns a jwt token
router.post('/login', (req, res) => {
    const email = req.fields.username;
    const password = req.fields.password;

    if (!email || !password)    {
        return UtilsRoutes.replyFailure(res,"","Insert username/password");
    }

    DBAccess.users.getUserByEmail(email,async (err, user) => {
        if (err) {
            throw err;
        }
        if (!user) {
            return UtilsRoutes.replyFailure(res, err, USER_NOT_FOUND);
        }

        if(user.validation === "confirmed") {
            try {
                var passwordsMatch = await Utils.comparePasswordAsync(password, user.password);
            }   catch (e)   {
                throw err;
            }

            if (!passwordsMatch)    {
                return UtilsRoutes.replyFailure(res,err,WRONG_PASSWORD_PART_1 + user.remaining_attempts + WRONG_PASSWORD_PART_2);
            }   else    {

               let tokenInfo = user._doc

                console.log("Logging in with email: ", email);
                NtuaAPI.person.getPerson(email, (response, error) =>  {
                    if (error)  {
                        ba_logger.ba("Failed request to NTUA")
                        throw new Error(error);
                    }   else    {
                        ba_logger.ba("Successful request to NTUA")
                        var parsedResponse = JSON.parse(response);
                        console.log(parsedResponse);

                        if (parsedResponse.id)    {
                            tokenInfo['id'] = parsedResponse.id;
                        }
                    }

                console.log("New Login, original token content: \n", user._doc);
                console.log("New Login, NTUA content: \n", parsedResponse.id);
                console.log("New Login, token content: \n", tokenInfo);
                const token = jwt.sign(tokenInfo, DB_SECRET, {
                    expiresIn: 10800
                });

                let data =    {
                    success: true,
                    token: 'bearer ' + token,
                    user: {
                        id: user.id,
                        qualichainId: tokenInfo["id"],
                        name: user.name,
                        email: user.email,
                        roles: user.roles,
                    },
                };


                //logger.warn("Login: "+ data.user.type + "," + data.user.name + ", logged in at " + Utils.utc);
                ba_logger.ba("Login:" + data.user.id + ":" + data.user.email);
                UtilsRoutes.replySuccess(res, data, "Logged in");
                });
            }
        }
    });
});

router.post('/testNTUA', async (req, res) =>     {
    if(!Iam.isAdministrator(req))    {
        UtilsRoutes.replyFailure(res,"Only recruiters can access this route",'');
        return;
    }
    const email = req.fields.email;
    console.log(email)
    NtuaAPI.person.getPerson(email, (response, error) =>  {
        if (error)  {
            ba_logger.ba("Failed request to NTUA")
            throw new Error(error);
        }   else    {
            ba_logger.ba("Successful request to NTUA")
             UtilsRoutes.replySuccess(res,JSON.parse(response),"");
        }
    });

});


router.post('/iAmRecruiter', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(!Iam.isRecruiter(req))    {
        UtilsRoutes.replyFailure(res,"Only recruiters can access this route",'');
        return;
    }
    try {
        UtilsRoutes.replySuccess(res, '', "Your role is recruiter");

    } catch (e) {
        ba_logger.ba("BA||ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

router.post('/iAmStudent', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(!Iam.isStudent(req))    {
        UtilsRoutes.replyFailure(res,"Only students can access this route",'');
        return;
    }
    try {
        UtilsRoutes.replySuccess(res, '', "Your role is student");

    } catch (e) {
        ba_logger.ba("BA||ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

router.post('/iAmProfessor', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(!Iam.isProfessor(req))    {
        UtilsRoutes.replyFailure(res,"Only professors can access this route",'');
        return;
    }
    try {
        UtilsRoutes.replySuccess(res, '', "Your role is professor");

    } catch (e) {
        ba_logger.ba("BA||ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

router.post('/iAmAcademic', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(!Iam.isAcademic(req))    {
        UtilsRoutes.replyFailure(res,"Only students professors can access this route",'');
        return;
    }
    try {
        UtilsRoutes.replySuccess(res, '', "Your role is student and/or professor");

    } catch (e) {
        ba_logger.ba("BA||ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

module.exports = router;