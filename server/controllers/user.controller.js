import User from "../models/user.model.js";
export const getcurrentuser = async (req, res) =>{
    try {
        const userId = req.user_id;
        let user = await User.findOne({ _id : userId }); //Need in {} object form ...
        if(!user){
            return res.status(404).json({message:"user does not exist"});
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({message:`Cant Get User ${error}`});
    }
};