const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { total_invoice_list,total_invoice_amount_details } = require('../controllers/totalinvoiceController');
const router = express.Router();

router.get("/total_invoice_list",jwtMiddleware,total_invoice_list);
router.get("/total_invoice_amount_details",jwtMiddleware,total_invoice_amount_details);
module.exports = router;