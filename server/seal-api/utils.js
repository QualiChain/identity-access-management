var https = require('https');
var unirest = require('unirest');

class Utils {
    constructor() {
        this.getRequest = getRequest;
        this.unirestPost = unirestPost;
        this.getAccessToken = getAccessToken;
    }
}

let utils = module.exports = exports = new Utils();

function getAccessToken (code, cb) {
    const options = {
        hostname: "https://dss1.aegean.gr",
        port: "8080",
        path: "/auth/realms/SSI/protocol/openid-connect/token",
        method: "POST",
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

    return cb( { profile }, null);
}
function getRequest(getOptions, callback) {
    const request = https.request(getOptions, function(res) {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            callback(JSON.parse(data));
        });
    });
    request.on('error', (e) => {
        callback("Error: " + e);
    });
    request.end();
}

function postRequestData(postOptions, postData, callback) {
    const request = https.request(postOptions, function(res) {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            callback(JSON.parse(data));
        });
    });
    request.on('error', (e) => {
        callback("Error on Utils.postRequest: " + e);
    });
    if (postData)   {
        request.write(postData);
    }

    request.end();
}

function unirestPost(api_key, uri, payload, callback) {
    var req = unirest('POST', uri)
        .headers({
            'API_KEY': api_key,
            'Content-Type': 'application/json'
        })
        .attach()
        .send(JSON.stringify(payload))
        .end(function (res) {
            if (res.error) {
                //User not found, but there is no error
                 if (res.raw_body === "{\n  \"msg\": \"User does not exists\"\n}\n") {
                     return (callback(res.raw_body, null));
             }
                return (callback(null,res.error));
            }
            return (callback(res.raw_body, null));
        });
}
