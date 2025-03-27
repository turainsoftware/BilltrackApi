const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { get_category_list_details,add_category } = require('../controllers/categoryController');
const router = express.Router();

router.get("/get_category_list_details",jwtMiddleware,get_category_list_details);
router.post("/add_category",jwtMiddleware,add_category);

module.exports = router;