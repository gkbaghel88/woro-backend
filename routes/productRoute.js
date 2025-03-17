const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.post("/addProduct", productController.createProduct);
router.get("/proList", productController.getProducts);
router.get("/product:id", productController.getProductById);
router.put("/product:id", productController.updateProduct);
router.delete("/product:id", productController.deleteProduct);

module.exports = router;
