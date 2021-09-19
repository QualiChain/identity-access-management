const IdentityScope = require('./identity-scope');
const path = require('path')
let dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname,'../../../.env')});
dotenv.load();
const SEAL_SECRET = process.env.SEAL_SECRET;
const SEAL_REDIRECT_URL_LOCAL = process.env.SEAL_REDIRECT_URL_LOCAL;
const SEAL_REDIRECT_URL_PROD = process.env.SEAL_REDIRECT_URL;
let SEAL_REDIRECT_URL = process.env.NODE_ENV === 'development' ? SEAL_REDIRECT_URL_LOCAL: SEAL_REDIRECT_URL_PROD;
const SEAl_CLIENT_ID = process.env.SEAL_CLIENT_ID;
const SEAL_ACCESS_TOKEN_URI = process.env.SEAL_ACCESS_TOKEN_URI;
const SEAL_AUTHORIZATION_URI = process.env.SEAL_AUTHORIZATION_URI;
const SEAL_USER_INFO_URI = process.env.SEAL_USER_INFO_URI;
const uuid = require("uuid");

const Utils = require('./utils');
const logger = require("../log/ba_logger");
var ClientOAuth2 = require('client-oauth2')
const nonce = uuid.v4();

var SEALAuthEduGain = new ClientOAuth2({
    clientId: SEAl_CLIENT_ID,
    clientSecret: SEAL_SECRET,
    accessTokenUri: SEAL_ACCESS_TOKEN_URI,
    authorizationUri: SEAL_AUTHORIZATION_URI,
    redirectUri: SEAL_REDIRECT_URL_LOCAL,
    scopes: ['openid', 'UAegean_myeduGAIN_ID'],
    state: nonce
})

class SEALApi {
    constructor() {
        this.getAccessTokenSEAL = getAccessTokenSEAL;
        this.getUserInfo = getUserInfo;
        this.getUri = getUri;
        this.createCode = createCode;
    }
}

async function createCode(code) {
    return SEALAuthEduGain.createToken(code);
}
async function getUri() {
    return SEALAuthEduGain.code.getUri()
}
async function getAccessTokenSEAL(oAuthCode)    {
    logger.ba('BA|AUTH|LOGIN_SEAL|getAccessTokenSEAL|Code=' + code);
    SEALAuthEduGain.code.getToken(SEAL_AUTHORIZATION_URI)
        .then(function (user) {getAccessTokenSEAL
            console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }

            // Refresh the current users access token.
            user.refresh().then(function (updatedUser) {
                console.log(updatedUser !== user) //=> true
                console.log(updatedUser.accessToken)
            })

            // Sign API requests on behalf of the current user.
            user.sign({
                method: 'get',
                url: SEAL_USER_INFO_URI
            })

            // We should store the token into a database.
            return user;
        })
}
async function getAccessTokenSEALManual(code)    {
    logger.ba('BA|AUTH|LOGIN_SEAL|getAccessTokenSEAL|Code=' + code);
    //    let uri = "https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/token" +
    //     '?' + 'code=' + code + '?secret=' + SEAL_SECRET + '?scope=' + scope + '?response_type=code'
    //     + '?redirect_uri=' + SEAL_REDIRECT_URL;
    let uri = "https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/token";

    //let uri = "https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/token" + '?' + 'grant_type=authorization_code' + '&code=' + code + '&secret=' + SEAL_SECRET + '&scope=' + scope + '&response_type=code' + '&redirect_uri=' + SEAL_REDIRECT_URL;
    let redirect = process.env.NODE_ENV === 'DEVELOPMENT'? SEAL_REDIRECT_URL_LOCAL : SEAL_REDIRECT_URL;

    let payload = {
        grant_type: "authorization_code",
        code: code,
        client_id: SEAl_CLIENT_ID,
        client_secret: SEAL_SECRET,
        redirect_uri: redirect
    }
     Utils.unirestPost(null,uri,payload, (response, error) =>  {
        console.log("access token")
        if (error)  {
            console.log("Error: ");
            console.log(error);
            throw new Error(error);
        }   else if (response)  {
            console.log("response is: ");
            console.log(response);

        }
    });
}



   function getUserInfoN(accessToken, refreshToken, profile, cb) {
        const options = {
            hostname: _user_info_request,
            port: _user_info_port,
            path: "/auth/realms/grids/protocol/openid-connect/userinfo",
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Length": "0",
            },
        };
        const httpsReq = https.request(options, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function () {
                const body = Buffer.concat(chunks);
                console.log("******* USER INFO **********************");
                console.log(body.toString());
            });
        });
        httpsReq.end();

        return cb(null, { profile });
    }

async function getUserInfo(auth_code)    {
    logger.ba('BA|AUTH|LOGIN_SEAL|getUserInfo|Auth_code=' + auth_code);
    //    let uri = "https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/token" +
    //     '?' + 'code=' + code + '?secret=' + SEAL_SECRET + '?scope=' + scope + '?response_type=code'
    //     + '?redirect_uri=' + SEAL_REDIRECT_URL;
    let uri = "https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/userinfo";
    console.log(uri);
    console.log("auth_code to be sent is : ");
    console.log(auth_code);
    const options = {
        headers: {
            'Authorization': 'Bearer ' + auth_code,
        }
    };

    let user = Utils.getRequest(options,uri,"empty payload", (response, error) =>  {
        if (error)  {
            throw new Error(error);
        }   else if (response)  {
            console.log("response from userinfo: ");
            console.log(response);
            return response;
        }
    });
}
async function getUserInfoManual(auth_code)    {
    logger.ba('BA|AUTH|LOGIN_SEAL|getUserInfo|Auth_code=' + auth_code);
    //    let uri = "https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/token" +
    //     '?' + 'code=' + code + '?secret=' + SEAL_SECRET + '?scope=' + scope + '?response_type=code'
    //     + '?redirect_uri=' + SEAL_REDIRECT_URL;
    let uri = "https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/userinfo";
    console.log(uri);
    console.log("auth_code to be sent is : ");
    console.log(auth_code);
    const options = {
        headers: {
            'Authorization': 'Bearer ' + auth_code,
        }
    };

    let user = Utils.getRequest(options,uri,"empty payload", (response, error) =>  {
        if (error)  {
            throw new Error(error);
        }   else if (response)  {
            console.log("response from userinfo: ");
            console.log(response);
            return response;
        }
    });
}

let SEAL = module.exports = exports = new SEALApi();
