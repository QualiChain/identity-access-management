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
    let organization;

    if (!req.hasOwnProperty('user')) {
        UtilsRoutes.replyFailure(res,JSON.stringify(""),"An error has been encountered");
    }

    if (req.user._doc.hasOwnProperty('id'))   {
        id = req.user.id;
    }   else    {
        id = req.user._id;
    }
    if (req.user._doc.hasOwnProperty('name'))   {
        name = req.user.name;
    }
    if (req.user._doc.hasOwnProperty('email')) {
        email = req.user.email;
    }
    if (req.user._doc.hasOwnProperty('roles')) {
        roles = req.user.roles;
    }
    if (req.user._doc.hasOwnProperty('organization')) {
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

router.post('/login/seal', async (req, res) => {
    const code = req.fields.code;
    switch (req.fields.scope) {
        case 'openid,SEAL-EDUGAIN':
            break;
        case 'openid,SEAL-EIDAS':
            break;
        case 'openid,SEAL-EIDAS-EDUGAIN':
            break;
        default:
            throw new Error(`scope not defined, ${req.fields.scope}`);
    }
    const scope = req.fields.scope;
    const ip = req.connection.remoteAddress;
    ba_logger.ba("BA|AUTH|LOGIN_SEAL|" + ip);
    try {
        let accessToken = await sealApi.getAccessTokenSEAL(code, scope);
        console.log(accessToken);
        //const token = await SEALAPI.getAccessTokenSEAL(code);
        //inspect token
        //https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/token/introspect

        //user info
        //https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/userinfo
        UtilsRoutes.replySuccess(res,"",accessToken)
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