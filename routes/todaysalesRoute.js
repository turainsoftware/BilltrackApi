const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { today_invoice__list,today_invoice_amount_details } = require('../controllers/todaysalesController');
const router = express.Router();

router.get("/today_invoice__list",jwtMiddleware,today_invoice__list);
router.get("/today_invoice_amount_details",jwtMiddleware,today_invoice_amount_details);
module.exports = router;