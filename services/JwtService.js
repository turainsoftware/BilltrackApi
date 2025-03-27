const jwt=require('jsonwebtoken')
const generateToken=({id,phoneNumber})=>{
    const payload={id: id,phoneNumber: phoneNumber}
    const JWT_SECRET=process.env.JWT_SECRET
    const token=jwt.sign(payload,JWT_SECRET,{
        expiresIn: '24h'
    })
    return token;
}



const jwtMiddleware = (req, res, next) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
    const authorization = req.headers['authorization'];

    // Check if authorization header exists and starts with "Bearer "
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ status: false, message: "Unauthorized Request" });
    }

    // Extract token after "Bearer "
    const token = authorization.substring(7);

    // Verify the token
    const userData=jwt.verify(token, JWT_SECRET);
    req.user=userData
    next()
    } catch (error) {
        res.status(401).json({ status: false, message: "Unauthorized Request" });    }
};
module.exports={generateToken,jwtMiddleware}