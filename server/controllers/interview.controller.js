import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from 'node:fs';
import { AI } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import { isValidObjectId } from "mongoose";



const pdfAnalyse = async (req, res) => {
	try {
		if (!req.file) {
			console.log("pawar1");
			return res.status(400).json({ message: "PDF file is required" });
		}

		const data = fs.readFileSync(req.file.path); //the binary data or the buffer format

		const pdf = await pdfjsLib.getDocument({
			data: new Uint8Array(data),
		}).promise;

		let resumetxt = "";
		for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
			const page = await pdf.getPage(pageNumber);
			const content = await page.getTextContent();
			resumetxt += `${content.items.map((item) => item.str).join(" ")}\n`;
		}
		resumetxt = resumetxt.replace(/\s+/g, " ").trim();


        // Our Prompt To AI := 
		const messages = [
			{
				role: "system",
				content:
					"Extract role, experience, projects, and skills. Return only valid JSON: {\"role\":string|null,\"experience\":[{\"title\":string,\"company\":string,\"duration\":string}],\"projects\":[{\"name\":string,\"description\":string}],\"skills\":string[]}. Use null/[] if unavailable; no Markdown or extra text.",
			},
			{
				role: "user",
				content: resumetxt,
			},
		];

		

		const Response = await AI(messages);
		const parsed = JSON.parse(
			typeof Response === "string" ? Response : JSON.stringify(Response)
		);


		if (req.file?.path && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path); // delete the uploaded PDF after processing
		}

	

		return res.status(200).json({
			text: resumetxt,
			result : parsed,
		}  );
	} catch (error) {
        // even now if file remaing , earlier error came in removing, so removeit 
        // if file is now also redable , so remove it , space is occupied 

		if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
		return res.status(500).json({
			message: "Failed to extract text from PDF",
			error: error.message,
		});
	}
};



const generateQuestion = async (req, res) => {
	try {
		
		const body = req.body || {};
		let { role, experience, mode, resumetxt, projects, skills } = body;

		if (
			role === undefined || role === null || String(role).trim() === "" ||
			experience === undefined || experience === null || String(experience).trim() === "" ||
			mode === undefined || mode === null || String(mode).trim() === ""
		) {
			return res.status(400).json({
				message: "Role, experience, and mode are required",
			});
		}
		

		if (!req.user_id || !isValidObjectId(req.user_id)) {
			return res.status(401).json({ message: "Invalid user ID" });
		}


		const user = await User.findById(req.user_id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		if (user.credits < 50) { 
			return res.status(403).json({ message: "Insufficient credits" });
		}

		
		role = String(role).trim();
		experience = String(experience).trim();
		mode = String(mode).trim();
		// Resume text is optional; store an empty resume as an empty string.
		const safeResume = resumetxt == null ? "" : String(resumetxt).trim();
		
		const normalizedProjects = Array.isArray(projects)
			? projects
				.map((project) => {
					if (typeof project === "string") {
						return { name: project.trim(), description: "" };
					}
					if (project && typeof project === "object") {
						return {
							name: String(project.name || "Project").trim(),
							description: String(project.description || "").trim(),
						};
					}
					return null;
				})
				.filter(Boolean)
			: [];

		const normalizedSkills = Array.isArray(skills)
			? skills
				.map((skill) => String(skill).trim())
				.filter(Boolean)
			: [];

		const projecttxt = normalizedProjects.length
			? normalizedProjects.map((project) => project.name || project.description || "Project").join(", ")
			: "none";
		const skilltxt = normalizedSkills.length
			? normalizedSkills.join(", ")
			: "none";

		const projectText = projecttxt.length >= 1 ? projecttxt : "none";
		const skillText = skilltxt.length >= 1 ? skilltxt : "none";

		const userPrompt = `
Role: ${role}
Experience: ${experience}
InterviewMode: ${mode}
Projects: ${projectText}
Skills: ${skillText}
Resume: ${safeResume}`;

		const response = await AI([
			{
				role: "system",
				content: `You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy
Question 2 → easy
Question 3 → medium
Question 4 → medium
Question 5 → hard

Make questions based on the candidate's role, experience, interviewMode, projects, skills, and resume details.`,
			},
			{ role: "user", content: userPrompt },
		]);

		

		const responseText = typeof response === "string"
			? response
			: Array.isArray(response)
				? response.map((item) => typeof item === "string" ? item : item?.content ?? item?.text ?? "").join("\n")
				: response?.choices?.[0]?.message?.content ?? response?.content ?? response?.text ?? "";

		const questions = responseText
			.replace(/```(?:[a-z]+)?/gi, "")
			.trim()
			.split(/\r?\n/)
			.map((line) => line
				.replace(/^\s*(?:question\s*)?\d+[.):]?\s*/i, "")
				.replace(/^\s*[-*]\s*/, "")
				.trim()
				.replace(/^['\"“”]+|['\"“”]+$/g, "")
				.trim())
			.filter(Boolean);

	

		const validQuestions = questions.length === 5 && questions.every((question) => question.length > 0);

		


		if (!validQuestions) {
			console.error("Invalid AI question response:", {
				rawResponse: response,
				parsedQuestions: questions,
			});
			return res.status(502).json({ message: "AI returned invalid interview questions" });
		}


		const questionDifficulties = ["easy", "easy", "medium", "medium", "hard"];
		const questionTimeLimits = [60, 60, 90, 90, 120];

		const interviewQuestions = questions.map((question, index) => {
			const difficulty = questionDifficulties[index] ?? "hard";
			const timeLimit = questionTimeLimits[index] ?? 120;

			return {
				question,
				difficulty,
				timeLimit,
			};
		});

		

		user.credits -= 50;
		await user.save();

		const interview = await Interview.create({
			userId: user._id,
			role,
			experience,
			mode,
			resumeTxt: safeResume,
			skills: normalizedSkills,
			projects: normalizedProjects,
			questions: interviewQuestions,
		});


		return res.status(200).json({
			interviewid: interview._id,
			creditsleft: user.credits,
			username: user.username,
			questions: interviewQuestions,
		});

	} catch (error) {

		console.error("Generate question error:", error);
		return res.status(500).json({
			message: "Failed to generate interview question",
			error: error.message,
		});
	}
};


const submitanswer = async (req, res) => {
	try {
		const { interviewid, questionindex, answer, timetaken } = req.body;
		if (!req.user_id || !isValidObjectId(req.user_id)) {
			return res.status(401).json({ message: "Invalid user ID" });
		}
		if (!isValidObjectId(interviewid)) {
			return res.status(400).json({ message: "Invalid interview ID" });
		}
		const interview = await Interview.findById(interviewid);

		if (!interview) {
			return res.status(404).json({ message: "Interview not found" });
		}
		if (String(interview.userId) !== String(req.user_id)) {
			return res.status(403).json({ message: "Unauthorized interview access" });
		}

		const index = Number(questionindex);
		const question = interview.questions[index];
		if (!Number.isInteger(index) || !question) {
			return res.status(400).json({ message: "Invalid question index" });
		}

		let score = 0;
		let confidence = 0;
		let communication = 0;
		let correctness = 0;
		let feedback;
		const submittedAnswer = answer == null ? "" : String(answer).trim();

		if (!submittedAnswer) {
			feedback = "You did not submit answer";
			question.answer = "";
		} else if (Number(timetaken) > Number(question.timeLimit)) {
			score = 0;
			feedback = "Time exceeded, answer not evaluated";
			question.answer = submittedAnswer;
		} else {
			const evaluation = await AI([
				{
					role: "system",
					content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate finalScore as the average of confidence, communication, and correctness, rounded to the nearest whole number.

Feedback rules:
- Write natural human feedback.
- Use 10 to 15 words only.
- Sound like real interview feedback.
- You may suggest improvement if needed.
- Do not repeat the question or explain scoring.
- Keep the tone professional and honest.

Return only valid JSON in this format:
{"confidence":number,"communication":number,"correctness":number,"finalScore":number,"feedback":"short human feedback"}
`,
				},
				{
					role: "user",
					content: `Question: ${question.question}\nAnswer: ${submittedAnswer}`,
				},
			]);
			const result = JSON.parse(typeof evaluation === "string" ? evaluation : JSON.stringify(evaluation));
			confidence = Math.max(0, Math.min(10, Number(result.confidence) || 0));
			communication = Math.max(0, Math.min(10, Number(result.communication) || 0));
			correctness = Math.max(0, Math.min(10, Number(result.correctness) || 0));
			score = Math.max(0, Math.min(10, Number(result.finalScore) || 0));
			feedback = String(result.feedback || "");
			question.answer = submittedAnswer;
		}

		question.score = score;
		question.confidence = confidence;
		question.communication = communication;
		question.correctness = correctness;
		question.feedback = feedback;
		await interview.save();   

		return res.status(200).json({
			feedback,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Failed to submit answer",
			error: error.message,
		});
	}
};

const finishInterview = async (req, res) => {
	try {
		const { interviewid } = req.body;
		if (!req.user_id || !isValidObjectId(req.user_id)) {
			return res.status(401).json({ message: "Invalid user ID" });
		}
		if (!isValidObjectId(interviewid)) {
			return res.status(400).json({ message: "Invalid interview ID" });
		}
		const interview = await Interview.findById(interviewid);

		if (!interview) {
			return res.status(404).json({ message: "Interview not found" });
		}
		if (String(interview.userId) !== String(req.user_id)) {
			return res.status(403).json({ message: "Unauthorized interview access" });
		}

		const questions = interview.questions || [];
		if (!questions.length) {
			return res.status(400).json({ message: "Interview has no questions" });
		}

		const average = (field) => {
			const total = questions.reduce((sum, question) => {
				return sum + (Number(question[field]) || 0);
			}, 0);

			return total / questions.length;
		};

		const finalScore = average("score");
		const averageCommunication = average("communication");
		const averageCorrectness = average("correctness");
		const averageConfidence = average("confidence");
		const questionWiseScore = questions.map((question) => ({
			question: question.question,
			answer: question.answer || "",
			difficulty: question.difficulty || "Interview",
			score: Number(question.score) || 0,
			feedback: question.feedback || "",
			confidence: Number(question.confidence) || 0,
			communication: Number(question.communication) || 0,
			correctness: Number(question.correctness) || 0,
		}));

		interview.finalScore = finalScore;
		interview.status = "completed";
		await interview.save();

		return res.status(200).json({
			role: interview.role,
			experience: interview.experience,
			skills: interview.skills || [],
			projects: interview.projects || [],
			finalScore,
			averageCommunication,
			averageCorrectness,
			averageConfidence,
			questionWiseScore,
			createdAt: interview.createdAt,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Failed to finish interview",
			error: error.message,
		});
	}
};

const getMyInterviews = async (req, res) =>{
	try {
		if (!req.user_id || !isValidObjectId(req.user_id)) {
			return res.status(401).json({ message: "Invalid user ID" });
		}

		const interviews = await Interview.find({ userId: req.user_id })
			.select("role experience mode finalScore status createdAt")
			.sort({ createdAt: -1 });

		return res.status(200).json({ interviews });
	} catch (error) {
		return res.status(500).json({
			message: "Failed to fetch interviews",
			error: error.message,
		});
	}
};



const getInterviewReport = async(req, res) => {
	try {
		const { id: interviewid } = req.params;

		if (!req.user_id || !isValidObjectId(req.user_id)) {
			return res.status(401).json({ message: "Invalid user ID" });
		}
		if (!interviewid || !isValidObjectId(interviewid)) {
			return res.status(400).json({ message: "Invalid interview ID" });
		}

		const interview = await Interview.findById(interviewid);
		if (!interview) {
			return res.status(404).json({ message: "Interview not found" });
		}
		if (String(interview.userId) !== String(req.user_id)) {
			return res.status(403).json({ message: "Unauthorized interview access" });
		}

		const questions = interview.questions || [];
		const average = (field) => questions.length
			? questions.reduce((sum, question) => sum + (Number(question[field]) || 0), 0) / questions.length
			: 0;

		return res.status(200).json({
			role: interview.role,
			experience: interview.experience,
			skills: interview.skills || [],
			projects: interview.projects || [],
			finalScore: Number(interview.finalScore) || 0,
			averageCommunication: average("communication"),
			averageCorrectness: average("correctness"),
			averageConfidence: average("confidence"),
			questionWiseScore: questions.map((question) => ({
				question: question.question,
				answer: question.answer || "",
				difficulty: question.difficulty || "Interview",
				score: Number(question.score) || 0,
				feedback: question.feedback || "",
				confidence: Number(question.confidence) || 0,
				communication: Number(question.communication) || 0,
				correctness: Number(question.correctness) || 0,
			})),
			createdAt: interview.createdAt,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Failed to fetch interview report",
			error: error.message,
		});
	}
}

export { pdfAnalyse, generateQuestion, submitanswer, finishInterview, getMyInterviews, getInterviewReport };




