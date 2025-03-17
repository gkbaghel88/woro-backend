const Order = require("../models/Order");
const redis = require("../config/redisConfig");
const io = require("../config/socketConfig");

//  Create Order & Notify via WebSockets
exports.createOrder = async (req, res) => {
  try {
    const { userId, products, totalAmount } = req.body;
    const order = new Order({ userId, products, totalAmount });
    await order.save();

    io.emit("orderUpdate", { orderId: order._id, status: "Pending" });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//  Update Order Status & Notify Clients
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    io.emit("orderUpdate", { orderId: order._id, status });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
