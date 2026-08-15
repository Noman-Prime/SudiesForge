import mongoose from "mongoose"

const optionSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        _id: false
    }
)

const questionSchema = new mongoose.Schema(
    {
        questionNumber: {
            type: Number,
            required: true,
            min: 1
        },
        type: {
            type: String,
            enum: ["mcq", "short", "long"],
            required: true,
            default: "mcq"
        },
        statement: {
            type: String,
            required: true,
            trim: true
        },
        options: {
            type: [optionSchema],
            default: [],
            validate: {
                validator: function (options) {
                    if (this.type !== "mcq") {
                        return true
                    }

                    return options.length >= 2
                },
                message: "MCQ questions must contain at least two options"
            }
        },
        marks: {
            type: Number,
            min: 0,
            default: 1
        },
        image: {
            public_id: {
                type: String,
                trim: true,
                default: ""
            },
            url: {
                type: String,
                trim: true,
                default: ""
            }
        }
    },
    {
        _id: true
    }
)

const sectionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: ""
        },
        instructions: {
            type: String,
            trim: true,
            default: ""
        },
        questions: {
            type: [questionSchema],
            required: true,
            validate: {
                validator: (questions) => questions.length > 0,
                message: "Every section must contain at least one question"
            }
        }
    },
    {
        _id: true
    }
)

const pastPaperSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        year: {
            type: Number,
            required: true,
            min: 1900,
            max: new Date().getFullYear()
        },
        paperCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: ""
        },
        duration: {
            type: String,
            required: true,
            trim: true
        },
        totalMarks: {
            type: Number,
            required: true,
            min: 1
        },
        instructions: {
            type: [
                {
                    type: String,
                    trim: true
                }
            ],
            default: []
        },
        sections: {
            type: [sectionSchema],
            required: true,
            validate: {
                validator: (sections) => sections.length > 0,
                message: "At least one paper section is required"
            }
        },
        creationMethod: {
            type: String,
            enum: ["manual", "ocr"],
            default: "manual"
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        },
        publishedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

pastPaperSchema.index({
    event: 1,
    year: -1,
    status: 1
})

const pastPaper =
    mongoose.models.PastPaper ||
    mongoose.model("PastPaper", pastPaperSchema)

export default pastPaper