const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['volunteer', 'branch head', 'head'], // restrict to these roles
    required: true
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model('User', userSchema);