var express = require('express');
var router = express.Router();

var cashExpenses = require('../model/cashExpenses.js');
var mainConfig = require('../config/mainConfig.js');

// API for ajax call...
router.get('/statistic', function(req, res){
    var query = {
        login: req.cookies.login,
        year: new Date(Date.now()).getFullYear()
    };

    cashExpenses.getByQuery(query, 0, function(err, cashExpenses) {
        if (err) throw err;

        res.send(JSON.stringify(cashExpenses));
    });
});

// API for ajax call...
router.post('/getDataById', function(req, res){
    cashExpenses.getById(req.body.id, function(err, cashExpense) {
        if (err) throw err;

        var date = cashExpense.day + '-' + cashExpense.month + '-' + cashExpense.year + ' ';
        date += cashExpense.hour + ':' + cashExpense.minute + ':' + cashExpense.second;

        var result = {
            id: cashExpense._id,
            spent_on: cashExpense.spent_on,
            amount: cashExpense.amount,
            currency: mainConfig.currency,
            date: date
        };

        res.send(JSON.stringify(result));
    });
});

// API for ajax call...
router.post('/delete', function(req, res){

    cashExpenses.deleteById(req.body.id, function(err, deleteResult) {
        if (err) throw err;

        var result = {
            status: false,
            redirect: '/',
            message: 'An error occurred: it is not possible to delete the data'
        };

        if (deleteResult.deletedCount > 0) {
            result.status = true;
            result.message = 'OK';

            console.log('data has been deleted ok...');
        }

        res.send(JSON.stringify(result));
    });
});

router.post('/add', function(req, res){
    var now = Date.now();
    var currentDate = new Date(now);
    var newCashExpenses = new cashExpenses ({
        _id: now,
        login: req.cookies.login,
        spent_on: req.body.spent_on,
        amount: req.body.amount,
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        hour: currentDate.getHours(),
        minute: currentDate.getMinutes(),
        second: currentDate.getSeconds(),
        date_in_ms: now
    });

    cashExpenses.saveNewExpenses(newCashExpenses, function(err, savedCashExpenses) {
        if (err) throw err;

        console.log('saved new ok...');

        res.redirect('/');
    });
});

router.post('/edit', function(req, res){
    cashExpenses.getById(req.body.id, function(err, cashExpense) {
        if (err) throw err;

        cashExpense.spent_on = req.body.spent_on;
        cashExpense.amount = req.body.amount;

        cashExpense.save();

        console.log('some data has been changed ok...');

        res.redirect('/');
    });
});

module.exports = router;
