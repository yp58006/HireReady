import jwt from "jsonwebtoken"

const isauth = async (req, res, next) => {
    try {
        let {token} = req.cookies;
        if(!token) return res.status(400).json({message:"Token Not Found"}) 
        const verifytoken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!verifytoken) {
            return res.status(404).json({message:"nt verified token, relogin"});
        }
        req.user_id = verifytoken.user_id || verifytoken.id;
        next() 
    } catch(error) {
        return res.status(400).json({message:"error in isAuth"})
    }
}

export default isauth;