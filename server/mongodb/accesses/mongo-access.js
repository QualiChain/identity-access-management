function MongoAccess() {
    this.users = require('./access-user');
    this.utils = require('./utils-accesses');
    this.recruiter = require('./access-recruiter');
}

let mongo_access = module.exports = exports = new MongoAccess;