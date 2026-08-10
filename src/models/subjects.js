import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Event"
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String
        }
    }
}, { timestamps: true })

const subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema)

export default subject