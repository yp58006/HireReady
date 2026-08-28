import jwt from "jsonwebtoken";


const generatetoken = (userId)=>{
    try {
        const token = jwt.sign({user_id: userId},  process.env.JWT_SECRET_KEY, {expiresIn:"7d"});
        return token;
    } catch (error) {
        console.log(error + `Hellow`);
        return null;
    }
}

export default generatetoken;