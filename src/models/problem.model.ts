import mongoose, { Schema} from "mongoose";

const problemSchema = new Schema({
// title
// statement
// input format
// outputFormat
// constraints
// sampleInput
// sampleOutput
// explaination
// difficulty
// created BY:UserID
// tags
// testCase:objectID
// timeLimit
// memoryLimit

    title: {
        type: String,
        required: true
    },
    statement: {
        type: String,
        required:true,
    },
    inputFormat: {
        type: String,
        required: true
    },
    outputFormat: {
        type: String,
        required: true
    },
    constraints: {
        type: String,
        required: true
    },
    sampleInput: {
        type: String,
        required: true
    },
    sampleOutput: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["easy", "medium", "hard"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    testCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },
            explanation: {
                type: String,
                required: true
            }
        }
    ],
    timeLimit: {
        type: Number,
        required: true
    },
    memoryLimit: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})