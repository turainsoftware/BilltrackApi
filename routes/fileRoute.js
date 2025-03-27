const express=require('express');
const { serveImage } = require('../controllers/fileController');
const router=express.Router();


router.get('/image/:name',serveImage);



module.exports=router