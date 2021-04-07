'use strict'
let dotenv = require('dotenv');
const path = require('path')
dotenv.config({path: path.join(__dirname,'../../.env')});
dotenv.load();

function Iam() {
    this.roleIs = roleIs;
    this.isStudent = isStudent;
    this.isProfessor = isProfessor;
    this.isRecruiter = isRecruiter;
    this.isAcademic = isAcademic;
    this.isAdministrator = isAdministrator;
    this.isValidAPIKey = isValidAPIKey;
}

let iam = module.exports = exports = new Iam;
let validAPIKeys = [];
validAPIKeys.push(process.env.NTUA_API_KEY_INCOMING);
validAPIKeys.push(process.env.NTUA_API_KEY_INCOMING_LOCAL);
validAPIKeys.push(process.env.SEAL_API_KEY_INCOMING_LOCAL);
validAPIKeys.push(process.env.SEAL_API_KEY_INCOMING);

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


function isStudent(req) {
    const role = req.user.roles;
    return contains(role, "student");
}

function isProfessor(req) {
    const role = req.user.roles;
    return contains(role, "professor");
}

function isRecruiter(req) {
    const role = req.user.roles;
    return contains(role, "recruiter");
}

function isAcademic(req) {
    const role = req.user.roles;
    return contains(role, "professor") || contains(role, "student");
}
function isAdministrator(req) {
    const role = req.user.roles;
    return contains(role, "administrator");
}

function isValidAPIKey(req) {
    const apiKey = req.headers['api_key'];
    return contains(validAPIKeys, apiKey);
}

function contains(array, object)    {
    return array.some(e => e === object)
}