const DBAccess = require('./../mongodb/accesses/mongo-access');
const express = require('express');
const router = express.Router();
const dbConfig = require('../../config/db');
const Utils = require('../mongodb/accesses/utils-accesses');
const UtilsRoutes = require('../routes/utils-routes');
const Iam = require('../routes/iam');
const ba_logger = require('../log/ba_logger');
const passport = require('passport');
const NtuaAPI = require('../ntua-api/ntua');
require('dotenv').load();
const DB_SECRET = process.env.DB_SECRET;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM;
const JWT_LIFETIME = process.env.JWT_LIFETIME;
//const JWT_SECRET_SIGNING_KEY = JSON.parse(`"${process.env.JWT_SECRET_SIGNING_KEY}"`)
const JWT_SECRET_SIGNING_KEY = process.env.JWT_SECRET_SIGNING_KEY;

const USER_NOT_FOUND = "User not found.";
const WRONG_PASSWORD_PART_1 = "Wrong password. You have ";
const WRONG_PASSWORD_PART_2 = " remaining attempts.";
const WRONG_PASSWORD_INVALIDATE = "Your account has been blocked";
const USER_INVALID = "";
const USER_UNCONFIRMED = "Confirm your account";
const COMP_ADDED = "user added";
const NOT_COMP = "Not a company";
const DUP_ENTRY = "user already exists";
const ERROR = "An error concerning DB has occurred.";
const COMPANY_UPDATED = "Company has been updated.";
const ALLOWED_ROLES = ["student","professor","recruiter"];
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
router.post('/register', /*passport.authenticate('jwt', {session: false}),*/ function (req, res) {
    let name = req.fields.name;
    let email = req.fields.email;
    let password = req.fields.password;
    let organization = req.fields.organization;
    let userType = req.fields.userType;

    //organization === ""
    if (userType === "" || password === "" || email === "" || name === "")  {
        return UtilsRoutes.replyFailure(res,"ERROR: Missing parameters","ERROR: Missing parameters");
    }

    //organization === undefined
    if (userType === undefined || password === undefined || email === undefined || name === undefined)  {
        return UtilsRoutes.replyFailure(res,"ERROR: Missing parameters","ERROR: Missing parameters");
    }


    userType = userType.split(',');
    //userType = JSON.parse(userType);
    organization = organization.split(',');

    if (userType.length === 0)  {
        return UtilsRoutes.replyFailure(res,"ERROR: Missing role. Please insert role","ERROR: Missing role. Please insert role");
    }

    for (const candidateRole of userType)   {
        if (!Utils.contains(ALLOWED_ROLES, candidateRole))   {
            UtilsRoutes.replyFailure(res,"ERROR: user type does not exist","ERROR: user type does not exist");
            return;
        }
    }

    DBAccess.users.addUser(name, email, password, organization, userType, (err, addedCompany) =>     {
        if (err)  {
            if (err.name === 'MongoError' && err.code === 11000)    {
                //Duplicated username or contact
                return UtilsRoutes.replyFailure(res,err,"The user with the email " + email + " already exists. Please provide another email");
            } else  {
                return UtilsRoutes.replyFailure(res,err,ERROR);
            }
        }  else {
            ba_logger.ba(userType + ":" + name + "registered");
            return UtilsRoutes.replySuccess(res,"added user",COMP_ADDED);
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
    console.log("Logging in with email: ", email);
    DBAccess.users.getUserByEmail(email,async (err, user) => {
        if (err) {
            throw err;
        }
        if (!user) {
            return UtilsRoutes.replyFailure(res, err, USER_NOT_FOUND);
        }

        //if(user.validation === "confirmed") {
            try {
                var passwordsMatch = await Utils.comparePasswordAsync(password, user.password);
            }   catch (e)   {
                throw err;
            }

            if (!passwordsMatch)    {
                return UtilsRoutes.replyFailure(res,err,WRONG_PASSWORD_PART_1);
            }   else    {

                let userInfo = user._doc;
                let payload = {};
                //Necessary for get user by id
                payload["_id"] = userInfo._id.toString();
                payload["id"] = 'IAM-' + userInfo._id.toString();
                payload["name"] = userInfo.name;
                payload["email"] = userInfo.email;
                payload["remaining_attempts"] = userInfo.remaining_attempts;
                payload["roles"] = userInfo.roles;
                payload["organization"] = userInfo.organization;

                console.log("New Login, original token content: \n", payload);
                NtuaAPI.person.getPerson(payload.email, payload.name, payload.roles, payload.organization, async (response, error) =>  {
                    if (error)  {
                        ba_logger.ba("Failed request to NTUA");
                        ba_logger.ba("Proceeding with login (id, name,userPath will be missing)");
                        ba_logger.ba(error);
                    }   else    {
                        ba_logger.ba("Successful request to NTUA")
                        var parsedResponse = JSON.parse(response);
                        console.log(parsedResponse);

                        if (parsedResponse.id)    {
                            payload['id'] = JSON.stringify(parsedResponse.id);
                            payload['name'] = parsedResponse.fullName;
                            payload['userPath'] = parsedResponse.userPath;
                            //payload['email'] = parsedResponse.email;
                        }
                    }



                    console.log("New Login, payload content: \n", payload);
                    payload = UtilsRoutes.createPayload(payload);

                    console.log("New Login, payload content after Solid: \n", payload);
                    const token = await UtilsRoutes.createBearerToken(payload);
                    const identityToken = await UtilsRoutes.createIdentityToken(token, payload,false);

                    //logger.warn("Login: "+ data.user.type + "," + data.user.name + ", logged in at " + Utils.utc);
                    ba_logger.ba("Login:" + identityToken.user.id + ":" + identityToken.user.email);
                    UtilsRoutes.replySuccess(res, identityToken, "Logged in");
                });
            }

    });
});

router.post('/testNTUA', passport.authenticate('jwt', {session: false}), async (req, res) =>     {
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