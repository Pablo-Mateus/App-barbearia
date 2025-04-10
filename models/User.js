const mongoose = require("mongoose");

const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  phone: String,
  resetToken: String,
  resetTokenExpire: Date,
});

module.exports = User;
