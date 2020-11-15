const IdentityScope = require('./identity-scope');

class NtuaAPI {
    constructor() {
        this.person = IdentityScope;
    }
}

let NTUA = module.exports = exports = new NtuaAPI();
