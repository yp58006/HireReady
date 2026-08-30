import express from "express"
import dotenv from "dotenv"
import connectDb  from "./config/connectDb.js";
dotenv.config();

//these 3 Lines
import dns from "dns";
import cookieParser from "cookie-parser";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
//For dns errors in mongoDB Atlas Online connection


const PORT = process.env.PORT || 6000;

import cors from "cors";
import authRouter from "./routes/auth.router.js";
import userRouter from "./routes/user.router.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin : "https://hireready-client-2ay9.onrender.com",  // frontend Url , Requests from this url are also allowed 
    credentials : true
}));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);


app.listen(PORT, ()=>{
    console.log("server Running");
    connectDb();
}) 


