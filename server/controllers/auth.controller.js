import generatetoken from "../config/token.js";
import User from "../models/user.model.js"

export const googleAuth = async (req, res) =>{
    try {
        const {name, email, image} = req.body;
        let user = await User.findOne({ email }); //Need in {} object form ...
        if(!user){
            user = await User.create({name, email, image});
        } else if (image && !user.image) {
            user.image = image;
            await user.save();
        }
        const token = await generatetoken(user._id);
        // use httpOnly and sensible sameSite value; set secure:true in production with HTTPS
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7*24*60*60*1000 }); //7 days in milliseconds
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({message:`google Auth error ${error}`});
    }
};


export const logout = async(req, res)=>{
    try {
         res.clearCookie("token");
        return res.status(200).json({message:`Logged Out Sucessfully`});
    } catch (error) {
         return res.status(500).json({message:`LogOut error  ${error}`});
    }
}