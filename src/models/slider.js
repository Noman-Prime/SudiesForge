import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["withoutImage", "withImage"]
    },
    heading: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    highlightedText: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true })

const slider = mongoose.models.Sliders || mongoose.model("Sliders", sliderSchema)

export default slider