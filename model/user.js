//Mongoose connection to DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cash_expenses_manager', {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to DB successfully...');
});

//Crypt for hash password
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    login: {
        type: String,
        index:true
    },
    email: {
        type: String
    },
    password: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getByLogin = function(login, callback){
    var query = {login: login};
    User.findOne(query, callback);
};

module.exports.getAll = function(callback){
    User.find(callback);
};

module.exports.saveNewUser = function(newUser, callback){
    bcrypt.genSalt(15, function(err, salt) {
        if(err) throw err;
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            if(err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
};
