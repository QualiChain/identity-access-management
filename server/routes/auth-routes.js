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
const SEALAPI = require('../seal-api/seal');

router.post('/validateToken', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let id;
    let name;
    let email;

    if (req.user.id)   {
        id = req.user.id;
    }
    if (req.user.name)   {
        name = req.user.name;
    }
    if (req.user.email) {
        email = req.user.email;
    }
    try {
        const userInfo = {
            id: id,
            name: name,
            email: email,
            roles: req.user.roles
        }
        UtilsRoutes.replySuccess(res, userInfo, "Token Validated");

    } catch (e) {
        ba_logger.ba("BA||ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

router.post('/validateAPIKey', /*passport.authenticate('jwt', {session: false}),*/ async (req, res) => {
    //TODO check domain
    if(!Iam.isValidAPIKey(req))    {
        ba_logger.ba("BA|AUTH|ERROR|Invalid API Key");
        UtilsRoutes.replyFailure(res,"Invalid API Key",'');
        return;
    }
    try {
        let apiKey = req.headers["api_key"];
        ba_logger.ba("BA|AUTH|SUCCESS|Valid_API_Key:", apiKey);
        UtilsRoutes.replySuccess(res, "", "Valid API KEY");
    } catch (e) {
        ba_logger.ba("BA||ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

router.post('/login/seal', async (req, res) => {
   ba_logger.ba("BA|AUTH|LOGIN_SEAL");
    //const code = req.body.tokenq;
    const code = req.fields.tokenq;
    const ip = req.connection.remoteAddress;
    console.log("code")
    console.log(code)
    const token = await SEALAPI.getAccessTokenSEAL(code);
    UtilsRoutes.replySuccess(res,"","")
});


router.post('/checkRecruiter', /*passport.authenticate('jwt', {session: false}),*/ async (req, res) => {
    //TODO check domain
    if(!Iam.isValidAPIKey(req))    {
        ba_logger.ba("BA|AUTH|ERROR|Invalid API Key");
        UtilsRoutes.replyFailure(res,"Invalid API Key",'');
        return;
    }
    try {
        let apiKey = req.headers["api_key"];
        ba_logger.ba("BA|AUTH|SUCCESS|Valid_API_Key:", apiKey);
        let userEmail = req.fields.email;
        console.log(req.body)
        console.log(userEmail);

        if (!userEmail) {
            UtilsRoutes.replyFailure(res,"","Provide a user email on the body");
        }

        DBAccess.users.getUserByEmail(userEmail, (err, recruiter)=>   {
            if (err || !recruiter)  {
                UtilsRoutes.replyFailure(res, err, "No such user" );
                return;
            }

            const notARecruiterMessage = `${userEmail} is NOT a recruiter`;
            const successMessage = `${userEmail} is a recruiter`;

            const isRecruiter = recruiter.roles.some(e => e === "recruiter");

            if (isRecruiter)  {
                UtilsRoutes.replySuccess(res, true, successMessage );
            }
            else {
                UtilsRoutes.replySuccess(res, false, notARecruiterMessage );
            }

        });

    } catch (e) {
        ba_logger.ba("BA||ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});


module.exports = router;