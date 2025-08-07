const mongoose = require("mongoose");
const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // service provider
  category: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Service", ServiceSchema);
