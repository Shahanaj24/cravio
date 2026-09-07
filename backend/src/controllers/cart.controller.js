const cartModel = require('../models/cart.model');
const foodModel = require('../models/food.model');
const mongoose = require('mongoose');

// Shapes a cart document (with items.food populated) into the response
// format the frontend needs, computing subtotal/total from the *current*
// Food price in the DB so displayed numbers are always accurate.
function serializeCart(cart) {
    if (!cart) {
        return { items: [], totalAmount: 0 };
    }

    const items = cart.items
        // a referenced food may have been deleted by its partner; skip those
        .filter((item) => item.food)
        .map((item) => {
            const subtotal = item.food.price * item.quantity;
            return {
                food: item.food,
                quantity: item.quantity,
                price: item.food.price,
                subtotal
            };
        });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
        _id: cart._id,
        items,
        totalAmount
    };
}

async function getOrCreateCart(userId) {
    let cart = await cartModel.findOne({ user: userId });
    if (!cart) {
        cart = await cartModel.create({ user: userId, items: [] });
    }
    return cart;
}

async function addToCart(req, res) {
    const { foodId, quantity } = req.body;
    const user = req.user;

    if (!foodId) {
        return res.status(400).json({ message: "foodId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        return res.status(400).json({ message: "Invalid foodId" });
    }

    const qtyToAdd = Number(quantity) > 0 ? Math.floor(Number(quantity)) : 1;

    const food = await foodModel.findById(foodId);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }

    const cart = await getOrCreateCart(user._id);

    const existingItem = cart.items.find((item) => item.food.toString() === foodId);

    if (existingItem) {
        existingItem.quantity += qtyToAdd;
    } else {
        cart.items.push({ food: foodId, quantity: qtyToAdd });
    }

    await cart.save();
    await cart.populate('items.food');

    res.status(200).json({
        message: "Item added to cart",
        cart: serializeCart(cart)
    });
}

async function getCart(req, res) {
    const user = req.user;

    const cart = await cartModel.findOne({ user: user._id }).populate('items.food');

    res.status(200).json({
        message: "Cart fetched successfully",
        cart: serializeCart(cart)
    });
}

async function updateCartItem(req, res) {
    const { foodId } = req.params;
    const { quantity, action } = req.body;
    const user = req.user;

    const cart = await cartModel.findOne({ user: user._id });
    if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((i) => i.food.toString() === foodId);
    if (!item) {
        return res.status(404).json({ message: "Item not found in cart" });
    }

    if (action === "increase") {
        item.quantity += 1;
    } else if (action === "decrease") {
        item.quantity -= 1;
    } else if (quantity !== undefined) {
        const parsedQuantity = Number(quantity);
        if (!Number.isFinite(parsedQuantity) || !Number.isInteger(parsedQuantity)) {
            return res.status(400).json({ message: "Invalid quantity" });
        }
        item.quantity = parsedQuantity;
    } else {
        return res.status(400).json({ message: "Provide a quantity or an action of increase/decrease" });
    }

    if (item.quantity <= 0) {
        cart.items = cart.items.filter((i) => i.food.toString() !== foodId);
    }

    await cart.save();
    await cart.populate('items.food');

    res.status(200).json({
        message: "Cart updated successfully",
        cart: serializeCart(cart)
    });
}

async function removeCartItem(req, res) {
    const { foodId } = req.params;
    const user = req.user;

    const cart = await cartModel.findOne({ user: user._id });
    if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
    }

    const itemExists = cart.items.some((i) => i.food.toString() === foodId);
    if (!itemExists) {
        return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items = cart.items.filter((i) => i.food.toString() !== foodId);

    await cart.save();
    await cart.populate('items.food');

    res.status(200).json({
        message: "Item removed from cart",
        cart: serializeCart(cart)
    });
}

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    getOrCreateCart,
    serializeCart
}
