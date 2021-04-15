const Recruiter = require('./../models/recruiter');
const AccessUser = require('./access-user');
const Utils = require('./utils-accesses');

const bcrypt = require('bcrypt');
const saltRounds = 14;

let TYPE = 'RECRUITER';

class AccessRecruiter {
    constructor() {
        this.getRecruiterByEmail = AccessUser.getUserByEmail;
        this.addRecruiter = addRecruiter;
        this.updateRecruiter = updateRecruiter;
        this.getRecruiterNames = getRecruiterNames;
        this.getNumberOfCompanies = getNumberOfCompanies;
        this.confirmRecruiter = confirmRecruiter;
        this.invalidateRecruiter = invalidateRecruiter;
        this.decrementAttempts = decrementAttempts;
        this.resetAttempts = resetAttempts;
    }
}

let access_recruiter = module.exports = exports = new AccessRecruiter();


/********************************
 *  C.R.U.D. FUNCTIONS
 *******************************/

function addRecruiter(name, email, password, organization, callback) {
    let newRecruiter = new Recruiter({
        name: name,
        email: email,
        password: null,
        organization: organization,
    });

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                throw new Error(err);
            }
            newRecruiter.password = hash;
            newRecruiter.save(callback);
        });
    });
}

function updateRecruiter(id, name, description, location, contact, callback) {
    let conditions = {_id: id};
    let update = {$set: {
        name: name,
        description: description,
        location: location,
        contact: contact
    }};

    let options = {
        new: true,
        upsert: false
    };

    Recruiter.findByIdAndUpdate(conditions, update, options, callback);
}

function confirmRecruiter(email, callback) {
    console.log(email);
    let conditions = {email: email};
    let update = {$set: {
        validation: "confirmed"
    }};

    let options = {
        new: true,
    };

    Recruiter.update(conditions, update, options, callback);
}

function invalidateRecruiter(email, callback) {
    console.log(email);
    let conditions = {email: email};
    let update = {$set: {
        validation: "invalid"
    }};
    let options = {
        new: true
    };


    Recruiter.update(conditions, update, options, callback);
}


function resetAttempts(email, callback) {
    let conditions = {email: email};
    let update = { $set:  {remaining_attempts: 3}};
    let options = {
        new: true
    };


    Recruiter.findOneAndUpdate(conditions, update, options, callback);
}


function decrementAttempts(email, callback) {
    console.log(email);
    let conditions = {email: email};
    let update = { $inc: { remaining_attempts: -1 }};
    let options = {
        new: true
    };

    Recruiter.findOneAndUpdate(conditions, update, options, callback);
}

/*
function updateRecruiterName(id, name) {
    let conditions = {_id: id};
    let update = {$set: {
        name: name
    }};

    let options = {
        new: true,
        upsert: false
    };

    Recruiter.findByIdAndUpdate(conditions, update, options);
}

function updateRecruiterDescription(id, description) {
    let conditions = {_id: id};
    let update = {$set: {
        description: description
    }};

    let options = {
        new: true,
        upsert: false
    };

    Recruiter.findByIdAndUpdate(conditions, update, options);
}
function updateRecruiterLocation(id, location) {
    let conditions = {_id: id};
    let update = {$set: {
        location: location
    }};

    let options = {
        new: true,
        upsert: false
    };

    Recruiter.findByIdAndUpdate(conditions, update, options);
}

function updateRecruiterContact(id, contact) {
    let conditions = {_id: id};
    let update = {$set: {
        contact: contact
    }};

    let options = {
        new: true,
        upsert: false
    };

    Recruiter.findByIdAndUpdate(conditions, update, options);
}
*/

function getRecruiterNames(callback) {
    Recruiter.find({}, {'__t': false, '_id': true, 'name': true}, callback); // FIXME still sends __t
}

function getNumberOfCompanies(callback) {
    Recruiter.count(callback);
}