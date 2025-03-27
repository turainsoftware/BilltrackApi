const express = require('express');
const router = express.Router();
const {chk_username,mobile_otp,verify_otp} = require('../controllers/authController');

router.get('/chk_username', chk_username);
router.post('/mobile_otp', mobile_otp);
router.get('/otp-verification', verify_otp);
router.get('/',(req,res)=>{
    req.headers['authorization']
})


module.exports = router;
