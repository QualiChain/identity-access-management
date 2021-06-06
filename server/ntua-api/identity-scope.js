var Utils = require('./utils');
require('dotenv').load();
const api_key = process.env.NTUA_API_KEY;

class IdentityScope {
    constructor() {
        this.getPerson = getPerson;
    }
}

let identity = module.exports = exports = new IdentityScope();

// Access Tokens
function getPerson(email, name, roles, orgs, callback) {
    const uri = 'http://qualichain.epu.ntua.gr:5004/get/user/by/email';
    console.log(api_key);
    if (!api_key)   {
        return;
    }
    let payload = {"email":email, "name": name, "roles": roles, "organizations" : orgs};
    console.log("NTUA Request payload")
    Utils.unirestPost(api_key,uri, payload, callback)

    /*
    var unirest = require('unirest');
    var req = unirest('POST', uri)
        .headers({
            'API_KEY': api_key,
            'Content-Type': 'application/json'
        })
        .send(JSON.stringify({"email":email}))
        .end(function (res) {
            if (res.error) throw new Error(res.error);
            //console.log(res.raw_body);
            return (callback(res.raw_body));
        });

*/
    /*
    const data = JSON.stringify({"email": email});
    const config = {
        method: 'post',
        url: 'qualichain.epu.ntua.gr:5004/get/user/by/email',
        headers: {
            'Content-Type': 'application/json',
            'API_KEY': api_key
        },
        data : data
    };

    axios(config)
        .then(function (response) {
            const data = JSON.stringify(response.data);
            console.log("REQUEST OK");
            console.log(response.data.body);
            return response.data.body;
        })
        .catch(function (error) {
            console.log("REQUEST NOT OK");

            console.log(error);
        })

    */

}

