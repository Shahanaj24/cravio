const express = require('express');
const cartController = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

/* POST /api/cart/add [protected: user] */
router.post('/add',
    authMiddleware.authUserMiddleware,
    cartController.addToCart)

/* GET /api/cart [protected: user] */
router.get('/',
    authMiddleware.authUserMiddleware,
    cartController.getCart)

/* PATCH /api/cart/:foodId [protected: user] */
router.patch('/:foodId',
    authMiddleware.authUserMiddleware,
    cartController.updateCartItem)

/* DELETE /api/cart/:foodId [protected: user] */
router.delete('/:foodId',
    authMiddleware.authUserMiddleware,
    cartController.removeCartItem)

module.exports = router;
