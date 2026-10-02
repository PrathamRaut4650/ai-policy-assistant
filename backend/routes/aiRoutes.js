const express = require("express");
const Policy = require("../models/Policy");

const authenticate = require("../middleware/authMiddleware");
const PolicyChunk = require("../models/PolicyChunk");

const {
    generateEmbedding,
    generateAnswer
} = require("../services/geminiService");

const router = express.Router();

router.post("/search", authenticate, async (req, res) => {

    try {

        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Question is required"
            });
        }

        // Generate embedding for employee question
        const questionEmbedding = await generateEmbedding(question);

const results = await PolicyChunk.aggregate([
    {
        $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: questionEmbedding,
            numCandidates: 50,
            limit: 5
        }
    },
    {
        $project: {
            _id: 1,
            policyId: 1,
            content: 1,
            chunkIndex: 1,
            score: {
                $meta: "vectorSearchScore"
            }
        }
    }
]);

console.log("VECTOR SEARCH RESULTS:");

console.log(
    results.map((result) => ({
        policyId: result.policyId,
        chunkIndex: result.chunkIndex,
        score: result.score,
        content: result.content.substring(0, 200)
    }))
);

const context = results
    .map((result, index) => {
        return `Policy Chunk ${index + 1}:\n${result.content}`;
    })
    .join("\n\n");

console.log("AI CONTEXT:");
console.log(context);

        // Generate AI answer
        const answer = await generateAnswer(
            question,
            context
        );

        // Send response
        res.status(200).json({
            message: "AI answer generated successfully",
            question: question,
            answer: answer,

            sources: await Promise.all(
                results.map(async (result) => {

                    const policy = await Policy.findById(
                        result.policyId
                    ).select("title");

                    return {
                        policyId: result.policyId,
                        policyTitle: policy
                            ? policy.title
                            : "Unknown Policy",
                        chunkIndex: result.chunkIndex,
                        score: result.score
                    };
                })
            )
        });

    } catch (error) {

        console.error("AI search error:", error);

        res.status(500).json({
            message: "AI answer generation failed",
            error: error.message
        });
    }
});

module.exports = router;