const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

//  Add indexes for better search performance
productSchema.index({ name: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
