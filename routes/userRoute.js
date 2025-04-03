const express = require('express');
const { jwtMiddleware } = require('../services/JwtService');
const { profile, my_profile} = require('../controllers/userController');
const router = express.Router();

router.get("/profile",jwtMiddleware,profile)
router.get("/my-profile",jwtMiddleware,my_profile)

module.exports = router;