var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/User');
var LocalStrategy = require('passport-local').Strategy;


// signin
passport.use('local-login', new LocalStrategy({
        usernameField:'name',
        passwordField:'password'
    },
    function (name,password, done) {
        User.findOne({'name': name}, function (err, user) {
            // if there are any errors, return the error
            if (err) return done(err);
            // check to see if theres already a user with that email
            if (!user) {
                return done(null, false, {message: 'that name exists'});
            } else {
                user.comparePassword(password, function (err, isMatch) {
                    console.log(isMatch);
                    if (err) return done(err);
                    if (isMatch) return done(null, user);
                    return done(null, false);
                });
            }
        });
    }));


// Authentication signup
passport.use('local-signup', new LocalStrategy({
        usernameField:'name',
        passwordField:'password'
    },
    function (name,password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function () {
            // find a user whose name is the same as the forms name
            // we are checking to see if the user trying to login already exists
            User.findOne({'name': name}, function (err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if theres already a user with that email
                if (user) {
                    return done(err, false, {message: 'that name exists'});
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.name = name;
                    newUser.password = password;

                    // save the user
                    newUser.save(function (err) {
                        if (err)
                            return err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
//passport deserialize user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


router.post('/api/signup',passport.authenticate('local-signup'),function (req,res) {
    res.send(req.user);
});
router.post('/api/login',passport.authenticate('local-login'),function (req,res) {
    res.send(req.user);
});

router.post('/api/logout', function(req, res) {
    req.logout();
    res.send(200);
});

router.post('/api/status',isLoggedIn,function (req,res) {
});

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){
        return res.status(200).json({
            status: true
        });
    }
    res.status(200).json({
        status:false
    });
}

module.exports = router;
