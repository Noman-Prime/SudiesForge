import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
},{timestamps: true})

const event = mongoose.models.Event || mongoose.model("Event", eventSchema)
export default event