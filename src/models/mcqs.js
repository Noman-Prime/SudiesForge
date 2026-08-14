import mongoose from "mongoose"

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    isCorrect: {
        type: Boolean,
        required: true,
        default: false
    }
}, { _id: false })

const mcqsSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        required: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: true
    },
    statement: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [optionSchema],
        required: true,
        validate: [
            {
                validator: (options) =>
                    Array.isArray(options) &&
                    options.length >= 2,
                message: "At least two options are required"
            },
            {
                validator: (options) =>
                    Array.isArray(options) &&
                    options.filter(
                        (option) => option.isCorrect
                    ).length === 1,
                message: "Exactly one option must be correct"
            }
        ]
    },
    explanation: {
        type: String,
        trim: true,
        default: ""
    },
    mcqType: {
        type: String,
        enum: ["read", "test", "both"],
        default: "both",
        required: true
    }
}, { timestamps: true })

mcqsSchema.index({ event: 1 })
mcqsSchema.index({ subject: 1 })
mcqsSchema.index({ chapter: 1 })
mcqsSchema.index({ topic: 1 })
mcqsSchema.index({ mcqType: 1 })

const mcqs =
    mongoose.models.Mcq ||
    mongoose.model("Mcq", mcqsSchema)

export default mcqs