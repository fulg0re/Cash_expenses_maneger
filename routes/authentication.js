var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

var User = require('../model/user.js');
var mainConfig = require('../config/mainConfig.js');

router.get('/login', function(req, res){
    res.render("user/loginPage.ejs", {
        title: mainConfig.loginTitle,
        messages: req.flash()
    });
});

router.post('/login', function(req, res){
    var login = req.body.login;
    var password = req.body.password;
    User.getByLogin(login, function(err, user){
        if (err) throw err;
        if (user == null){
            req.flash('error', 'User does not exists.');
            res.redirect('/authentication/login');
        }else{
            User.comparePassword(password, user.password, function(err, isMatch){
                if (err) throw err;
                if (isMatch === true){
                    var authUser = {
                        login: user.login,
                        email: user.email
                    };
                    jwt.sign({authUser}, mainConfig.tokenSecretKey, {expiresIn: '1800s'}, (err, token) => {
                        req.flash('success', 'You logined successfully.');
                        res.cookie('auth_token', token);
                        res.cookie('login', authUser.login);
                        res.redirect('/');
                    });
                }else{
                    req.flash('error', 'Wrong password.');
                    res.redirect('/authentication/login');
                }
            });
        }
    });
});

router.get('/register', function(req, res){
    res.render("user/registerPage.ejs", {
        title: mainConfig.registerTitle,
        messages: req.flash()
    });
});

router.post('/register', function(req, res){
    var newUser = new User ({
        login: req.body.login,
        email: req.body.email,
        password: req.body.password
    });

    if (newUser.password !== req.body.passwordConfirmation){
        req.flash('error', 'Paswords do not match.');
        res.redirect('/authentication/register');
    }else{
        User.getByLogin(newUser.login, function(err, user){
            if (err) throw err;
            if (user !== null) {
                req.flash('error', 'User already exists.');
                res.redirect('/authentication/register');
            }else{
                User.saveNewUser(newUser, function(err, user){
                    if (err) throw err;
                    if (user){
                        req.flash('success', 'Registration is successful. You can login now.');
                        res.redirect('/authentication/login');
                    }else{
                        req.flash('error', 'Something went wrong.');
                        res.redirect('/authentication/register');
                    }
                });
            }
        });
    }
});

module.exports = router;
