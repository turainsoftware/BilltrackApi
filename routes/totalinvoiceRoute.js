const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { total_invoice_list,total_invoice_amount_details } = require('../controllers/totalinvoiceController');
const router = express.Router();

router.get("/total-invoice-list",jwtMiddleware,total_invoice_list);
router.get("/total-invoice-amount-details",jwtMiddleware,total_invoice_amount_details);
module.exports = router;