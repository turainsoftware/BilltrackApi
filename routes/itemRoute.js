const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { get_item_list_details } = require('../controllers/itemController');
const router = express.Router();

router.get("/get_item_list_details",jwtMiddleware,get_item_list_details);

module.exports = router;