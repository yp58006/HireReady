import express from "express";
import { googleAuth, logout } from "../controllers/auth.controller.js";


const authRouter = express.Router(); // a mini expres routing application

authRouter.post("/google", googleAuth);
authRouter.get("/logout", logout);

export default authRouter;