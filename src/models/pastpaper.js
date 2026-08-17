import mongoose from "mongoose"

const pastpaperSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Event"
    },
    name: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        required: true
    },
    instruction: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        trim: true,
    },
    mcq: [{
        sr_number: {
            type: Number,
            required: true
        },
        statement: {
            type: String,
            required: true,
            trim: true
        },
        options: [{
            option_number: {
                type: String,
                required: true,
                trim: true
            },
            option_text: {
                type: String,
                trim: true,
                required: true
            }
        }],
        correctOption: {
            type: String,
            required: true
        }
    }],
    detailQuestions: [{
        sr_number: {
            type: Number,
            required: true
        },
        statement: {
            type: String,
            required: true,
            trim: true
        }
    }]
}, { timestamps: true })

const pastpaper = mongoose.models.Pastpaper || mongoose.model("Pastpaper", pastpaperSchema)
export default pastpaper