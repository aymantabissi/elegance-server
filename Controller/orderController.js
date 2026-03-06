import Order from "../models/order.js";

// Créer une commande
export const createOrder = async (req, res) => {
  try {
    const { user, products, totalAmount, customerInfo } = req.body;

    // (اختياري) validation بسيط
    if (!user || !products?.length || !totalAmount || !customerInfo) {
      return res.status(400).json({ success: false, message: "Missing order data" });
    }

    const newOrder = await Order.create({
      user,
      products,
      totalAmount,
      customerInfo,
    });

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("products.product", "name price");

    return res.status(201).json({
      success: true,
      orderId: populatedOrder._id,
      order: populatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



// Récupérer toutes les commandes
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").populate("products.product", "name price");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
