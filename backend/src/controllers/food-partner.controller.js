const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const mongoose = require('mongoose');

async function getFoodPartnerById(req, res) {

    const foodPartnerId = req.params.id;

    const foodPartner = await foodPartnerModel.findById(foodPartnerId)
    const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId })

    if (!foodPartner) {
        return res.status(404).json({ message: "Food partner not found" });
    }

    res.status(200).json({
        message: "Food partner retrieved successfully",
        foodPartner: {
            ...foodPartner.toObject(),
            foodItems: foodItemsByFoodPartner
        }

    });
}

async function getMyFoodItems(req, res) {
    const foodItems = await foodModel.find({ foodPartner: req.foodPartner._id }).sort({ createdAt: -1 })

    res.status(200).json({
        message: "Partner food items retrieved successfully",
        foodItems
    })
}

async function deleteMyFoodItem(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.foodId)) {
        return res.status(400).json({ message: "Invalid food item id" })
    }

    const foodItem = await foodModel.findOneAndDelete({
        _id: req.params.foodId,
        foodPartner: req.foodPartner._id
    })

    if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" })
    }

    res.status(200).json({
        message: "Food item deleted successfully",
        foodId: foodItem._id
    })
}

module.exports = {
    getFoodPartnerById,
    getMyFoodItems,
    deleteMyFoodItem
};