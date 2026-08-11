import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    chapterNumber: {
        type: Number,
        required: true
    },
    chapterName: {
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

const chapter = mongoose.models.Chapter || mongoose.model("Chapter", chapterSchema)
export default chapter