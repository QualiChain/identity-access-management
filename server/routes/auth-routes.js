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
const sealApi = require('../seal-api/seal');
const uuid = require("uuid");
router.get('/oidc/.well-known/openid-configuration', async (req, res) => {
    try {
        let wellKnown = UtilsRoutes.getWellKnown();
        UtilsRoutes.replyObject(res, wellKnown, "wellKnown");
    }   catch (e) {
            ba_logger.ba("BA||ERROR|");
            UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
            throw new Error(e);
    }
});

router.get('/oidc/jwks', async (req, res) => {
    try {
        let JWKSString = JSON.stringify(UtilsRoutes.getJWKS());
        UtilsRoutes.replyObject(res, JWKSString);
    }   catch (e) {
            ba_logger.ba("BA||ERROR|");
            UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
            throw new Error(e);
    }
});



router.post('/validateToken', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let id;
    let name;
    let email;
    let roles;
    let organization

    if (!req.hasOwnProperty('user')) {
        UtilsRoutes.replyFailure(res,JSON.stringify(""),"An error has been encountered");
    }

    if (req.user.hasOwnProperty('id'))   {
        id = req.user.id;
    }   else    {
        id = req.user._id;
    }
    if (req.user.hasOwnProperty('name'))   {
        name = req.user.name;
    }
    if (req.user.hasOwnProperty('email')) {
        email = req.user.email;
    }
    if (req.user.hasOwnProperty('roles')) {
        roles = req.user.roles;
    }
    if (req.user.hasOwnProperty('organization')) {
        organization = req.user.organization;
    }
    try {
        const userInfo = {
            id: id,
            name: name,
            email: email,
            roles: roles,
            organizations: organization
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

router.post('/verifyRecruiter', /*passport.authenticate('jwt', {session: false}),*/ async (req, res) => {
    //TODO it looks like the server cant parse JSON bodies (text is received, JSON no)
    //TODO check domain
    if(!Iam.isValidAPIKey(req))    {
        ba_logger.ba("BA|AUTH|ERROR|Invalid API Key");
        return UtilsRoutes.replyFailure(res,"Invalid API Key",'');
    }
    try {
        let apiKey = req.headers["api_key"];
        ba_logger.ba("BA|AUTH|SUCCESS|Valid_API_Key:", apiKey);
        let userEmail = req.fields.email;
        console.log(req.body)
        console.log(userEmail);

        if (!userEmail) {
            return UtilsRoutes.replyFailure(res,"","Provide a user email on the body");
        }

        DBAccess.users.getUserByEmail(userEmail, (err, recruiter)=>   {
            if (err || !recruiter)  {
                return UtilsRoutes.replyFailure(res, err, "No such user" );
            }

            const notARecruiterMessage = `${userEmail} is NOT a recruiter`;
            const successMessage = `${userEmail} is a recruiter`;

            const isRecruiter = recruiter.roles.some(e => e === "recruiter");

            if (isRecruiter)  {
                return UtilsRoutes.replySuccess(res, true, successMessage );
            }
            else {
                return UtilsRoutes.replySuccess(res, false, notARecruiterMessage );
            }

        });

    } catch (e) {
        ba_logger.ba("BA||ERROR|");
        UtilsRoutes.replyFailure(res,JSON.stringify(e),"An error has been encountered");
        throw new Error(e);
    }
});

//todo change to seal
router.get('/login/init', async function (req, res) {
    const uri = await sealApi.getUri();
    res.redirect(uri)
})

router.post('/login/seal', async (req, res) => {
    const code = req.fields.code;
    const state = req.fields.state;
    let scope = '';
    if (state.includes('UAegean_myeduGAIN_ID')) {
        scope = 'openid%20UAegean_myeduGAIN_ID';
    } else if (state.includes('UAegean_myeIDAS_ID'))  {
        scope = 'openid%20UAegean_myeIDAS_ID';
    } else if (state.includes('UAegean_myLinkedID'))  {
        scope = 'openid%20UAegean_myLinkedID';
    }   else    {
            throw new Error(`invalid scope, ${req.fields.scope}`);
    }
    const ip = req.connection.remoteAddress;
    ba_logger.ba("BA|AUTH|LOGIN_SEAL|" + ip);
    try {
        //const oAuthCode = await sealApi.createCode(code)
        const accessToken = await sealApi.getAccessTokenSEAL();
        return;
        const user = await sealApi.getUserInfo(accessToken);

        /*
        let accessToken = await sealApi.getAccessTokenSEAL(code, async (error,response) => {
            console.log(response);
            console.log("accessToken is: ");
            console.log(accessToken);
            //inspect token
            //https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/token/introspect

            //user info
            //https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/userinfo

            const user = await sealApi.getUserInfo(accessToken);
            let payload  = {};
            //Create paylaod based on info received from SEAL
            payload["email"] = user.email;
            console.log("New Login, payload content: \n", payload);

            let parsedPayload = UtilsRoutes.createPayload(payload, true);

            console.log("New Login, payload content after Solid: \n", parsedPayload);
            const qualichainBearerToken = await UtilsRoutes.createBearerToken(parsedPayload);
            const identityToken = await UtilsRoutes.createIdentityToken(qualichainBearerToken, parsedPayload, true);

            UtilsRoutes.replySuccess(res, identityToken, "Logged in through SEAL");
            //UtilsRoutes.replySuccess(res,"",accessToken)
        });
    */
    }   catch (e) {
        UtilsRoutes.replyFailure(res,e,"Error retrieving access token");
        console.log(e);
    }
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