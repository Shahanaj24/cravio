const express = require('express');
const foodPartnerController = require("../controllers/food-partner.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/me/foods",
    authMiddleware.authFoodPartnerMiddleware,
    foodPartnerController.getMyFoodItems)

router.delete("/me/foods/:foodId",
    authMiddleware.authFoodPartnerMiddleware,
    foodPartnerController.deleteMyFoodItem)

/* /api/food-partner/:id */
router.get("/:id",
    authMiddleware.authUserMiddleware,
    foodPartnerController.getFoodPartnerById)

module.exports = router;