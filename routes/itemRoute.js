const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { get_item_list_details,add_item_details } = require('../controllers/itemController');
const router = express.Router();

router.get("/get-item-list-details",jwtMiddleware,get_item_list_details);
router.post("/add-item-details",jwtMiddleware,add_item_details);


module.exports = router;