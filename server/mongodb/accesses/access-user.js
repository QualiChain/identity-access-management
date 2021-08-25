const User = require('../models/user');
const Utils = require('./utils-accesses');
const bcrypt = require('bcrypt');
const saltRounds = 14;
// Abstract

let TYPE = 'User';

class AccessUser {
    constructor() {
        this.getUserById = getUserById;
        this.getUserByUsername = getUserByUsername;
        this.getUserByEmail = getUserByEmail;
        this.getUsers = getUsers;
        this.addUser = addUser;
    }
}

let access_user = module.exports = exports = new AccessUser();


/********************************
 *  C.R.U.D. FUNCTIONS
 *******************************/

function addUser(name, email, password, organizations, roles, callback) {
    let newUser = new User({
        name: name,
        email: email,
        password: null,
        organization: organizations,
        roles: roles
    });

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                throw new Error(err);
            }
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

function getUserById(id, callback) {
    User.findById(id)
        .exec(function (err, item) {
            Utils.findByIDCallback(err, item, callback, TYPE);
        });
}

function getUserByUsername(username, callback) {
    const query = {username: username};
    User.findOne(query, callback);
}

function getUserByEmail(email, callback) {
    const query = {email: email};
    User.findOne(query, callback);
}

async function getUsers() {
    return await User.find().exec();
}