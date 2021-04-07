'use strict'
require('dotenv').load();
const jwt = require('jsonwebtoken');

const JWT_ALGORITHM = process.env.JWT_ALGORITHM;
const JWT_LIFETIME = process.env.JWT_LIFETIME;
//const JWT_SECRET_SIGNING_KEY = JSON.parse(`"${process.env.JWT_SECRET_SIGNING_KEY}"`)
const JWT_SECRET_SIGNING_KEY = process.env.JWT_SECRET_SIGNING_KEY;
const DUMMY_OIDC_URL = process.env.DUMMY_OIDC_URL;

function Utils() {

    // Quick Replies
    this.replySuccess = replySuccess;
    this.replyFailure = replyFailure;
    this.replyObject = replyObject;
    this.serveObject = serveObject;
    this.requireRole = requireRole;
    this.roleIs = roleIs;
    this.saveFile = saveFile;
    this.createIdentityToken = createIdentityToken;
    this.createBearerToken = createBearerToken;
    this.createPayload = createPayload;
    this.getWellKnown = getWellKnown;
    this.getJWKS = getJWKS;
    this.routeIsBlocked = false;
}

let utils = module.exports = exports = new Utils;

/*****************************
 Quick Replies
 *****************************/
function serveObject(obj,message)   {
    let response = {};
    response.succeeded = true;
    response.message = message;
    res.send(obj);
}


function replyFailure(res, err, message) {
    let response = {};
    response.response_data = null;
    response.succeeded = false;
    response.message = message;
    response.error = err;
    res.send(response);
}

function replySuccess(res, data, message) {
    let response = {};
    response.response_data = data;
    response.succeeded = true;
    response.message = message;
    res.send(response);
}

function replyObject(res, obj) {
    res.send(obj);
}

function requireRole(req, res, role) {
    if (req.user.__t !== role) {
        replyFailure(res, 'Not a ' + role, '');
    }
}

// roleIs is meant to be called before the DB queries.
// It provides an extra layer of security and resources saving
function roleIs(req, role) {
    for (var userRole of req.user.roles){
        if(userRole === role){
            return (true)
        }
    }
    return (false);
}

function saveFile(data, name) {
    fs.writeFile(path.join(__dirname,"../files/" + name + Date.now() + ".txt"),{mode: w}, util.inspect(data), function(err) {
        if(err) {
            return console.log(err);
        }

        ba_logger.ba("BA|"+ "FILE_SAVED|" + name + "|" + new Date());
    });

}

function createPayload (payload, isSEAL = false)  {
    let webid = "not defined";
    //Not needed for now
    //payload["oidc_url"] = DUMMY_OIDC_URL;

    //ID from NTUA exists
    if (payload['id'])   {
        webid = "https://solid.qualichain-project.eu/webid/" + payload["id"] + "#me";
    }  else {
        webid = "https://solid.qualichain-project.eu/webid/" + payload["_id"] + "#me";
    }
    // WebID URL for user USERID
    payload["webid"] = webid;

    payload["client_id"] = "https://qualichain-project.eu";
    //Check if logged in from SEAL
    payload["isSeal"] = isSEAL;

    return payload;
}

async function createBearerToken(payload)   {

    return jwt.sign(payload, JWT_SECRET_SIGNING_KEY, {
        expiresIn: JWT_LIFETIME,
        algorithm: JWT_ALGORITHM,
        issuer: DUMMY_OIDC_URL,
        audience: "solid",
        keyid: 'QualiChain authorisation public key',
        jwtid: Math.random().toString().split(".")[1]
    });
}
async function createIdentityToken(token, payload, isSEAL=false)    {

    let identityToken =    {
        token: 'bearer ' + token,
        client_id: "https://qualichain-project.eu",

        user: {
            localUser: !isSEAL,
            isSEAL: isSEAL,
            id: payload["id"],
            email: payload["email"],
            name: payload["name"],
            roles: payload["roles"]
        },
    };

    return identityToken;

}


function getWellKnown () {
    let obj =
        {

            "issuer":
            DUMMY_OIDC_URL,

        // matches iss URL in token

        "authorization_endpoint":
        DUMMY_OIDC_URL + "/authorize",

        "token_endpoint":
        DUMMY_OIDC_URL + "/token",

        "userinfo_endpoint":
        DUMMY_OIDC_URL + "/userInfo",

        "registration_endpoint":
        DUMMY_OIDC_URL + "/register",

        "end_session_endpoint":
            DUMMY_OIDC_URL + "/endsession",

        "jwks_uri":
            DUMMY_OIDC_URL + "/jwks",

        "response_types_supported": [

            "code"

        ],

        "grant_types_supported": [

            "authorization_code",

            "refresh_token"

        ],

        "subject_types_supported": [

            "public"

        ],

        "claims_supported": [

            "sub",

            "webid"

        ],

        "scopes_supported": [

            "openid",

            "profile",

            "email",

            "offline_access"

        ],

        "token_endpoint_auth_methods_supported": [

            "client_secret_basic"

        ],

        "token_endpoint_auth_signing_alg_values_supported": [

            "ES256"

        ],

        "request_object_signing_alg_values_supported": [

            "ES256"

        ],

        "id_token_signing_alg_values_supported": [

            "ES256"

        ],

        "code_challenge_methods_supported": [

            "plain",

            "S256"

        ],

        "claims_parameter_supported":
            false,

        "request_parameter_supported":
            true,

        "request_uri_parameter_supported":
            false,

        "require_request_uri_registration":
            false

    };

    return obj;
}

function getJWKS()  {
    let obj = {
        "keys": [
            {
                "e": "AQAB",
                "kid": "QualiChain authorisation public key",
                "kty": "RSA",
                "n": "2XJsdU1uQJOAfqWSDMHRKiYgKXB6wUPIoHCdS-GZDP4H1Jipw4KenZN2fJuc7Hw4BkAwG5t6ELGibIWXMvwXnwun9_kNxuMwcTpKCwsb_JC4fOvQdjDq0rPnmx_e7RF49IhWDOcQOF_SyPg1nWBT4rPE3nREY9sm_MjWEZrYl0f1s9sIYYnRLpnqwqISib8raRx2J6fh9P9z3weEOYT_MHdcuKblgoNB33Nya_d9un6laDOIi0F1TXZtx1MrCoJHNMOl-0-uFEVhdJuFehyvXvBYQ92hf9Gh1XOKrcGF7HEf4H9MKILr0RGUh6PKo3qNOW9YCfj0ZQ0Frq91ZeLLuRuNFoILRRIAajleuzShdDY1wfpXqsPZ6sGpFeOdXVvkIVYXGlz9yrOmMEIGsqPJDP5mIY_4SlP0mksbkWxFESGUGUMMqT-LWG3ojHdBoH1upeNSwAKJKMCs58wLLvdn-_Ghl5_tSoO2fZvd5fPOsKB7X8-vSbjja60j6RqgwADXPxEWjiXGGwmr1fonPcUx3dsaF4JCplu9Rlr1lA5YyKTd-LsM0IgWn6W3vWLmjBQAIPz-8di8akGrWDxhljoWvz87E3c0KKDpDM242yezbnGx9OW6q739UoqP6OzN2zR-JSEXoPxf6Jh_CtYBX1mXTPCNXrW6QyXnSUDADbZi8Nk"
            }
        ]
    }

    return obj;
}
