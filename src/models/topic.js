import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        required: true
    },
    topicNumber: {
        type: Number,
        required: true
    },
    topicName: {
        type: String,
        required: true,
        trim: true
    },
    sections: [{
        subHeading: {
            type: String,
            required: true,
            trim: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        }

    }],
    image: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }
}, { timestamps: true })

topicSchema.index({chapter: 1, topicNumber: 1}, { unique: true})

const topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema)

export default topic