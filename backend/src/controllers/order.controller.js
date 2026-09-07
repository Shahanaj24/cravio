const cartModel = require('../models/cart.model');
const orderModel = require('../models/order.model');
const { ORDER_STATUSES } = require('../models/order.model');

// Statuses a food partner is allowed to move an order to, and the statuses
// that are still considered "open" (cancellable / editable).
const CANCELLABLE_STATUSES = [ "PLACED", "CONFIRMED", "PREPARING" ];

async function createOrder(req, res) {
    const user = req.user;
    const { deliveryAddress } = req.body;

    if (!deliveryAddress || !deliveryAddress.trim()) {
        return res.status(400).json({ message: "deliveryAddress is required" });
    }

    const cart = await cartModel.findOne({ user: user._id }).populate('items.food');

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
    }

    // Any item whose referenced food was deleted after being added to the
    // cart can no longer be purchased - reject rather than silently drop it.
    const invalidItem = cart.items.find((item) => !item.food);
    if (invalidItem) {
        return res.status(400).json({ message: "One or more items in your cart are no longer available" });
    }

    // Group cart items by food partner - each Order belongs to a single
    // food partner, so a cart spanning multiple partners becomes multiple
    // orders.
    const itemsByPartner = new Map();

    for (const item of cart.items) {
        const partnerId = item.food.foodPartner.toString();

        if (!itemsByPartner.has(partnerId)) {
            itemsByPartner.set(partnerId, []);
        }

        // SECURITY: price is always read from the Food document fetched from
        // MongoDB just now - the client never supplies price or subtotal.
        itemsByPartner.get(partnerId).push({
            food: item.food._id,
            name: item.food.name,
            quantity: item.quantity,
            price: item.food.price
        });
    }

    const createdOrders = [];

    for (const [ partnerId, items ] of itemsByPartner.entries()) {
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = await orderModel.create({
            user: user._id,
            foodPartner: partnerId,
            items,
            totalAmount,
            deliveryAddress: deliveryAddress.trim(),
            paymentStatus: "PENDING",
            orderStatus: "PLACED"
        });

        createdOrders.push(order);
    }

    // Cart is consumed once the order(s) are placed
    cart.items = [];
    await cart.save();

    res.status(201).json({
        message: "Order placed successfully",
        orders: createdOrders
    });
}

async function getMyOrders(req, res) {
    const user = req.user;

    const orders = await orderModel.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate('foodPartner', 'name address phone');

    res.status(200).json({
        message: "Orders fetched successfully",
        orders
    });
}

async function getOrderById(req, res) {
    const { id } = req.params;
    const user = req.user;

    const order = await orderModel.findById(id).populate('foodPartner', 'name address phone');

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to view this order" });
    }

    res.status(200).json({
        message: "Order fetched successfully",
        order
    });
}

async function getPartnerOrders(req, res) {
    const foodPartner = req.foodPartner;

    const orders = await orderModel.find({ foodPartner: foodPartner._id })
        .sort({ createdAt: -1 })
        .populate('user', 'fullName email');

    res.status(200).json({
        message: "Orders fetched successfully",
        orders
    });
}

async function updateOrderStatus(req, res) {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const foodPartner = req.foodPartner;

    if (!orderStatus || !ORDER_STATUSES.includes(orderStatus)) {
        return res.status(400).json({
            message: `orderStatus must be one of: ${ORDER_STATUSES.join(", ")}`
        });
    }

    const order = await orderModel.findById(id);

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (order.foodPartner.toString() !== foodPartner._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to update this order" });
    }

    if (orderStatus === "CANCELLED" && !CANCELLABLE_STATUSES.includes(order.orderStatus)) {
        return res.status(400).json({ message: `Order in status ${order.orderStatus} can no longer be cancelled` });
    }

    if (order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED") {
        return res.status(400).json({ message: `Order in status ${order.orderStatus} can no longer be updated` });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
        message: "Order status updated successfully",
        order
    });
}

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getPartnerOrders,
    updateOrderStatus
}
