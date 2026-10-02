const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateEmbedding = async (text) => {
    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: text
        });

        return response.embeddings[0].values;

    } catch (error) {
        console.error("Gemini embedding error:", error);
        throw error;
    }
};


const generateAnswer = async (question, context) => {

    const prompt = `
You are an AI assistant for a company.

Answer the employee's question ONLY using the information provided in the policy context below.

Rules:
1. Do not use outside knowledge.
2. Do not make up or assume information.
3. If the answer cannot be found in the policy context, say:
"I couldn't find that information in the available company policies."
4. Give a clear and concise answer.
5. When possible, mention the relevant policy information directly.

Policy Context:
${context}

Employee Question:
${question}
`;

    try {

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
        });

        return response.text;

    } catch (error) {

        console.error(
            "Gemini 3.5 Flash failed:",
            error.status || error.message
        );

        // Fallback model
        try {

            console.log(
                "Trying Gemini 3.6 Flash..."
            );

            const fallbackResponse =
                await ai.models.generateContent({
                    model: "gemini-3.6-flash",
                    contents: prompt
                });

            return fallbackResponse.text;

        } catch (fallbackError) {

            console.error(
                "Gemini fallback error:",
                fallbackError.status ||
                fallbackError.message
            );

            throw fallbackError;
        }
    }
};


module.exports = {
    generateEmbedding,
    generateAnswer
};