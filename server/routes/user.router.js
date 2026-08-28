import express from "express";
import checkAuth from "../middlewares/checkAuth.js"
import { getcurrentuser } from "../controllers/user.controller.js";
const userRouter = express.Router(); // a mini expres routing application


userRouter.get("/currentuser", checkAuth, getcurrentuser);

export default userRouter;