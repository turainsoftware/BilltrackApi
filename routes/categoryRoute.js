const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { get_category_list_details,add_category,get_service_category_by_id,update } = require('../controllers/categoryController');
const { route } = require('./userRoute');
const router = express.Router();

router.get("/get-category-list-details",jwtMiddleware,get_category_list_details);
router.post("/add-category",jwtMiddleware,add_category);
router.put('/update/:id',jwtMiddleware ,update);
router.get('/get-service-category-by-id/:id',jwtMiddleware ,get_service_category_by_id);

module.exports = router;