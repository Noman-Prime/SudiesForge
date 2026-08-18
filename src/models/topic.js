import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
    {
        chapter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chapter",
            required: true,
        },

        topicNumber: {
            type: Number,
            required: true,
        },

        topicName: {
            type: String,
            required: true,
            trim: true,
        },

        sections: [
            {
                subHeading: {
                    type: String,
                    required: true,
                    trim: true,
                },

                text: {
                    type: String,
                    required: true,
                    trim: true,
                },
            },
        ],

        /* =========================================
           OPTIONAL TABLES
        ========================================= */

        tables: [
            {
                title: {
                    type: String,
                    trim: true,
                },

                headers: [
                    {
                        type: String,
                        trim: true,
                    },
                ],

                rows: [
                    [
                        {
                            type: String,
                            trim: true,
                        },
                    ],
                ],
            },
        ],

        /* =========================================
           OPTIONAL IMAGE
        ========================================= */

        image: {
            public_id: {
                type: String,
            },

            url: {
                type: String,
            },
        },
    },
    {
        timestamps: true,
    }
);

topicSchema.index(
    {
        chapter: 1,
        topicNumber: 1,
    },
    {
        unique: true,
    }
);

const Topic =
    mongoose.models.Topic ||
    mongoose.model("Topic", topicSchema);

export default Topic;