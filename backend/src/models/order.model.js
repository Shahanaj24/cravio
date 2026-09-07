const mongoose = require('mongoose');

const PAYMENT_STATUSES = [ "PENDING", "PAID", "FAILED" ];
const ORDER_STATUSES = [ "PLACED", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED" ];

const orderItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "food",
        required: true
    },
    name: {
        // snapshot of the food name at purchase time, so the order still
        // reads correctly even if the food is later renamed or deleted
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        // snapshot of the per-unit price at purchase time (server-calculated,
        // never trusted from the client). This must NOT change even if the
        // underlying Food's price changes later.
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foodpartner",
        required: true
    },
    items: {
        type: [ orderItemSchema ],
        required: true,
        validate: v => Array.isArray(v) && v.length > 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: PAYMENT_STATUSES,
        default: "PENDING"
    },
    orderStatus: {
        type: String,
        enum: ORDER_STATUSES,
        default: "PLACED"
    },
    deliveryAddress: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
