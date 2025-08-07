const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // hash in real use
  role: { type: String, enum: ["customer", "provider", "admin"] },
});
module.exports = mongoose.model("User", UserSchema);
