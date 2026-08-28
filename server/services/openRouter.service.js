import axios from "axios"
export const AI = async (message) => {
    try {
        if(!message || message.length === 0 || !Array.isArray(message)){
            throw new Error("Message is Empty");
        }
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini", messages : message
            },
            {
                headers:{
                    "Authorization": `Bearer ${process.env.OPENROUTERAPI_KEY}`,
                    "Content-Type": "application/json",
                }
            },
        )
        const content = response?.data?.choices?.[0]?.message?.content; // option Chaining 
        if(!content || !content.trim()) {
            throw new Error("Response Error");
        }

        return content;
    } catch (error) {
        const apiMessage = error.response?.data?.error?.message || error.message || "Unknown error";
        const apiError = new Error(`OpenRouter API error: ${apiMessage}`);
        apiError.status = error.response?.status;
        throw apiError;
    }
}