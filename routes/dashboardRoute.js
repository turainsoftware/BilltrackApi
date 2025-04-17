const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { total_revenue,todays_sales,total_invoice,total_customer,invoice_details_list,shown_data_under_range } = require('../controllers/dashboardController');
const router = express.Router();

router.get("/total-revenue",jwtMiddleware,total_revenue)
router.get("/todays-sales",jwtMiddleware,todays_sales)
router.get("/total-invoice",jwtMiddleware,total_invoice)
router.get("/total-customer",jwtMiddleware,total_customer)
router.get("/invoice-details-list",jwtMiddleware,invoice_details_list)
router.get("/data-under-range/:id",jwtMiddleware,shown_data_under_range)
module.exports = router;