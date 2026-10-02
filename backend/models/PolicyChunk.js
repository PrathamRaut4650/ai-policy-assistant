const mongoose = require("mongoose");

const policyChunkSchema = new mongoose.Schema(
    {
        policyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Policy",
            required: true
        },

        content: {
            type: String,
            required: true
        },

        chunkIndex: {
            type: Number,
            required: true
        },

        embedding: {
            type: [Number],
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("PolicyChunk", policyChunkSchema);