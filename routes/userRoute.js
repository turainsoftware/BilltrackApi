const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { profile, my_profile,user_details_list,add_user_details, update_user_details} = require('../controllers/userController');
const router = express.Router();

router.get("/profile",jwtMiddleware,profile)
router.get("/my-profile",jwtMiddleware,my_profile)
router.get("/user-details-list",jwtMiddleware,user_details_list)
router.post("/add-user",jwtMiddleware,add_user_details)
router.put("/update-user/:id",jwtMiddleware,update_user_details)

module.exports = router;