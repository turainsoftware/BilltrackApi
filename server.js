require("dotenv").config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('./config/dbConnection');

const userRouter = require('./routes/userRoute');
const authRouter = require('./routes/authRoute');
const dashboardRouter = require('./routes/dashboardRoute');
const fileRouter=require('./routes/fileRoute');
const todaysalesRouter=require('./routes/todaysalesRoute');
const totalinvoiceRouter=require('./routes/totalinvoiceRoute');
const categoryRouter=require('./routes/categoryRoute');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cors());

app.use('/api/v1/user',userRouter);
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/dashboard',dashboardRouter);
app.use("/api/v1/file",fileRouter);
app.use("/api/v1/today_sales",todaysalesRouter);
app.use("/api/v1/total_invoice",totalinvoiceRouter);
app.use("/api/v1/category",categoryRouter);

//Error Handling
app.use((err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message:err.message
    });
});

app.listen(3000, ()=> console.log('Server is running on port 3000'));