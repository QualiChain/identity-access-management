const IdentityScope = require('./identity-scope');
const path = require('path')
let dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname,'../../../.env')});
dotenv.load();
const SEAL_SECRET = process.env.SEAL_SECRET;
const SEAL_REDIRECT_URL_LOCAL = process.env.SEAL_REDIRECT_URL_LOCAL;
const SEAL_REDIRECT_URL_PROD = process.env.SEAL_REDIRECT_URL;
let SEAL_REDIRECT_URL = process.env.NODE_ENV === 'development' ? SEAL_REDIRECT_URL_LOCAL: SEAL_REDIRECT_URL_PROD;
const SEAl_CLIENT_ID = process.env.SEAl_CLIENT_ID;

const Utils = require('./utils');
const logger = require("../log/ba_logger");

class SEALApi {
    constructor() {
        this.getAccessTokenSEAL = getAccessTokenSEAL;
        this.getUserInfo = getUserInfo;
        this.person = IdentityScope;
    }
}

async function getAccessTokenSEAL(code, scope)    {
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
    let accessToken = await Utils.unirestPost(null,uri,payload, (response, error) =>  {
        if (error)  {
            console.log("Error: ");
            console.log(error);
            throw new Error(error);
        }   else if (response)  {
            console.log("response is: ");
            console.log(response);
            return accessToken;
        }
    });
    return accessToken;
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

let SEAL = module.exports = exports = new SEALApi();
