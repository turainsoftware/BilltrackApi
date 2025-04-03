const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { get_profile_details,update_profile_details } = require('../controllers/profileController');
const router = express.Router();

router.get("/get-profile-details",jwtMiddleware,get_profile_details);
router.put("/update-profile-details",jwtMiddleware,update_profile_details);


module.exports = router;