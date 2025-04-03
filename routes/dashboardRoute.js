const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { total_revenue,todays_sales,total_invoice,total_customer,invoice_details_list } = require('../controllers/dashboardController');
const router = express.Router();

router.get("/total-revenue",jwtMiddleware,total_revenue)
router.get("/todays-sales",jwtMiddleware,todays_sales)
router.get("/total-invoice",jwtMiddleware,total_invoice)
router.get("/total-customer",jwtMiddleware,total_customer)
router.get("/invoice-details-list",jwtMiddleware,invoice_details_list)
module.exports = router;