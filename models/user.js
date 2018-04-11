var mongoose                    = require("mongoose"),
    passportLocalMongoose       = require("passport-local-mongoose");

    
// Schema setup
var userSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true},
  password: String,
  avatar: String,
  firstName: String,
  lastName: String,
  email: String,
  isAdmin: {type: Boolean, default: false}
});

var options = {
  errorMessages: {
    IncorrectPasswordError: "Password is incorrect",
    IncorrectUsernameError: "Username is incorrect"
  }
};

// De esta manera añadimos una gran cantidad de funcionalidades de 
// autenticacion del paquete passportLocalMongoose a userSchema
userSchema.plugin(passportLocalMongoose, options);

module.exports = mongoose.model("User", userSchema);