const Product = require("../models/productModel.js");
const redis = require("../config/redisConfig");

//  Create Add new  Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const product = new Product({ name, description, price, category, stock });
    await product.save();
    
    // Clear cache after adding new product
    await redis.del("products");
    
    res.status(201).json({ Status: true, Message: "Product created", Data: product });
  } catch (error) {
    res.status(500).json({ Status: false, Message: "Internal Server Error" });
  }
};

//All Products (with Pagination, Filtering, Sorting)
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", category, search } = req.query;
    const redisKey = `products:${page}:${limit}:${sort}:${order}:${category}:${search}`;
    
    // Check cache first
    const cachedData = await redis.get(redisKey);
    if (cachedData) return res.json(JSON.parse(cachedData));

    const query = {};
    if (category) query.category = category;
    if (search) query.$text = { $search: search }; // Full-text search

    const products = await Product.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Store in cache for 1 hour
    await redis.set(redisKey, JSON.stringify(products), "EX", 3600);

    res.json(products);
  } catch (error) {
    res.status(500).json({ Status: false, Message: "Internal Server Error" });
  }
};

// Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache
    const cachedProduct = await redis.get(`product:${id}`);
    if (cachedProduct) return res.json(JSON.parse(cachedProduct));

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ Status: false, Message: "Product not found" });

    // Cache product for 1 hour
    await redis.set(`product:${id}`, JSON.stringify(product), "EX", 3600);
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ Status: false, Message: "Internal Server Error" });
  }
};

//  Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedProduct) return res.status(404).json({ Status: false, Message: "Product not found" });

    // Clear cache for updated product
    await redis.del(`product:${id}`);
    await redis.del("products");

    res.json({ Status: true, Message: "Product updated", Data: updatedProduct });
  } catch (error) {
    res.status(500).json({ Status: false, Message: "Internal Server Error" });
  }
};

//  Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) return res.status(404).json({ Status: false, Message: "Product not found" });

    // Clear cache
    await redis.del(`product:${id}`);
    await redis.del("products");

    res.json({ Status: true, Message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ Status: false, Message: "Internal Server Error" });
  }
};
