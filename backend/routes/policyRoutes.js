const express = require("express");
const multer = require("multer");
const path = require("path");
const Policy = require("../models/Policy");
const authenticate = require("../middleware/authMiddleware");
const checkHR = require("../middleware/roleMiddleware");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const PolicyChunk = require("../models/PolicyChunk");
const { generateEmbedding } = require("../services/geminiService");


const router = express.Router();

// Get all active policies
router.get("/", authenticate, async (req, res) => {
    try {
        const policies = await Policy.find({
            status: "active"
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            message: "Policies fetched successfully",
            policies: policies
        });

    } catch (error) {
        console.error("Fetch policies error:", error);

        res.status(500).json({
            message: "Failed to fetch policies"
        });
    }
});

// Store uploaded PDFs inside uploads folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }
});

// Only allow PDF files
const upload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (ext === ".pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
});


// HR uploads policy
router.post("/upload",authenticate,checkHR, upload.single("policy"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF file"
            });
        }

        const pdfPath = path.resolve(req.file.path);

const pdfBuffer = fs.readFileSync(pdfPath);

const parser = new PDFParse({
    data: pdfBuffer
});

const result = await parser.getText();

await parser.destroy();

const extractedText = result.text;

        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Policy title is required"
            });
        }

    const policy = await Policy.create({
    title: title,
    fileName: req.file.originalname,
    filePath: req.file.path,
    text: extractedText,
    uploadedBy: req.user.userId
});

// Split extracted text into chunks
const chunkSize = 1000;
const chunks = [];

for (let i = 0; i < extractedText.length; i += chunkSize) {
    chunks.push(
        extractedText.substring(i, i + chunkSize)
    );
}

// Save chunks in MongoDB
const chunkDocuments = [];

for (let i = 0; i < chunks.length; i++) {

    const embedding = await generateEmbedding(chunks[i]);

    chunkDocuments.push({
        policyId: policy._id,
        content: chunks[i],
        chunkIndex: i,
        embedding: embedding
    });
}

await PolicyChunk.insertMany(chunkDocuments);


        res.status(201).json({
            message: "Policy uploaded successfully",
            policy: policy
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to upload policy"
        });
    }
});

router.get("/:id/download",authenticate, async(req,res)=>{
    try{
        const policy = await Policy.findById(req.params.id);
        if(!policy){
            return res.status(404).json({
                message:"policy not found"
            })
        }
        const filePath = path.resolve(policy.filePath)
        if(!fs.existsSync(filePath)){
            return res.status(404).json({
                message:"Policy PDF file not found"
            })
        }
        res.download(
            filePath,
            policy.fileName,
            (error)=>{
                if(error){
                    console.error("Download error:",error)
                }
            }
        );
    }catch(error){
        console.error("Policy download error:",error);
        res.status(500).json({
            message:"failed to download policy"
        })
    }

})


module.exports = router;