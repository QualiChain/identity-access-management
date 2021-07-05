var https = require('https');
var unirest = require('unirest');

class Utils {
    constructor() {
        this.getRequest = getRequest;
        this.unirestPost = unirestPost;}
}

let utils = module.exports = exports = new Utils();

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
