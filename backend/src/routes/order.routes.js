const express = require('express');
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

/* POST /api/orders [protected: user] */
router.post('/',
    authMiddleware.authUserMiddleware,
    orderController.createOrder)

/* GET /api/orders/my-orders [protected: user] */
router.get('/my-orders',
    authMiddleware.authUserMiddleware,
    orderController.getMyOrders)

/* GET /api/orders/partner [protected: food partner] */
router.get('/partner',
    authMiddleware.authFoodPartnerMiddleware,
    orderController.getPartnerOrders)

/* PATCH /api/orders/:id/status [protected: food partner] */
router.patch('/:id/status',
    authMiddleware.authFoodPartnerMiddleware,
    orderController.updateOrderStatus)

/* GET /api/orders/:id [protected: user] */
router.get('/:id',
    authMiddleware.authUserMiddleware,
    orderController.getOrderById)

module.exports = router;
