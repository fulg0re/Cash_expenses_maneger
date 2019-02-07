//Mongoose connection to DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cash_expenses_manager', {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to DB successfully...');
});

// Cash Expenses Schema
var cashExpensesSchema = mongoose.Schema({
    _id: {
        type: String
    },
    login: {
        type: String
    },
    spent_on: {
        type: String
    },
    amount: {
        type: Number
    },
    day: {
        type: Number
    },
    month: {
        type: Number
    },
    year: {
        type: Number
    },
    hour: {
        type: Number
    },
    minute: {
        type: Number
    },
    second: {
        type: Number
    },
    date_in_ms: {
        type: String
    }
});

var cashExpenses = module.exports = mongoose.model('cashExpenses', cashExpensesSchema);

module.exports.getByLogin = function(login, callback){
    var query = {login: login};
    cashExpenses.find(query, callback).sort({date_in_ms: -1});
};

module.exports.getById = function(id, callback){
    var query = {_id: id};
    cashExpenses.findOne(query, callback);
};

module.exports.getByQuery = function(query, limit = 0, callback){
    cashExpenses.find(query, callback).sort({date_in_ms: -1}).limit(limit);
};

module.exports.deleteById = function(id, callback){
    var query = {_id: id};
    cashExpenses.deleteOne(query, callback);
};

module.exports.getAll = function(callback){
    User.find(callback);
};

module.exports.saveNewExpenses = function(newExpenses, callback){
    newExpenses.save(callback);
};
