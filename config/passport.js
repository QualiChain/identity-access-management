require('dotenv').load();
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const DBAccess = require('../server/mongodb/accesses/mongo-access');
const JWT_SECRET_VERIFICATION_KEY = process.env.JWT_SECRET_VERIFICATION_KEY;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM;

module.exports = exports = function passportUser (passport){
        let opts = {};
        opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
        opts.secretOrKey = JWT_SECRET_VERIFICATION_KEY;
        opts.algorithms = [JWT_ALGORITHM];
        passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
            DBAccess.users.getUserById(jwt_payload._id, (err, user) => {
                if (err) return done(err, false);
                if (user) return done(null, user);
                else return done(null, false);
            });
        }));
};