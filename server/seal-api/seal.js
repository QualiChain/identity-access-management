const IdentityScope = require('./identity-scope');

class SEALApi {
    constructor() {
        this.getAccessTokenSEAL = getAccessTokenSEAL;
        this.person = IdentityScope;
    }
}

async function getAccessTokenSEAL(token)    {
    return 3;
}

let SEAL = module.exports = exports = new SEALApi();
