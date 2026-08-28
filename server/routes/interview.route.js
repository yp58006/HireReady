import express from "express";
import {
	pdfAnalyse,
	generateQuestion,
	submitanswer,
	finishInterview,
	getMyInterviews,
	getInterviewReport,
} from "../controllers/interview.controller.js";
import checkAuth from "../middlewares/checkAuth.js";
import { upload } from "../middlewares/multer.js"

const interviewRouter = express.Router(); // a mini express routing application

console.log("helloji");
interviewRouter.post("/resume", checkAuth, upload.single("resume"), pdfAnalyse);
console.log("Going To Generate Questions ");
interviewRouter.post("/generatequestion", checkAuth, generateQuestion);
interviewRouter.post("/submitanswer", checkAuth, submitanswer);
interviewRouter.post("/finish", checkAuth, finishInterview);
interviewRouter.get("/get-interview", checkAuth, getMyInterviews);
interviewRouter.get("/report/:id", checkAuth, getInterviewReport);

export default interviewRouter; 