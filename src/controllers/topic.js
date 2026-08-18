import connect from "@/lib/db"
import { deleteFile, uploadFile } from "@/lib/upload"
import topic from "@/models/topic"
import { NextResponse } from "next/server"
import "@/models/chapter";

export const createTopic = async (req) => {
    try {
        await connect()
        const {
            chapter,
            topicNumber,
            topicName,
            sections,
            tables
        } = await req.json()

        const Topic = await topic.create({
            chapter,
            topicNumber,
            topicName,
            sections,
            tables
        })

        return NextResponse.json({
            success: true,
            message: "Topic is created",
            topic: Topic
        }, { status: 201 })
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: "This topic number already exists in the selected chapter",
            }, { status: 409 });
        }
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const updateTopic = async (req, id) => {
    try {
        await connect()
        const {
            chapter,
            topicNumber,
            topicName,
            sections,
            tables
        } = await req.json()

        const Topic = await topic.findByIdAndUpdate(
            id,
            {
                chapter,
                topicNumber,
                topicName,
                sections,
                tables
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!Topic) {
            return NextResponse.json({
                success: false,
                message: "Topic is not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Topic is update",
            topic: Topic
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: "This Topic number already exist"
            }, { status: 409 })
        }
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getTopic = async (req, id) => {
    try {
        await connect()
        const Topic = await topic.findById(id)

        if (!Topic) {
            return NextResponse.json({
                success: false,
                message: "Topic is not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Topic is found",
            topic: Topic
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getAllTopic = async (req) => {
    try {
        await connect()
        const Topics = await topic.find().populate("chapter")

        if (!Topics || Topics.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No Topic is found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Topic found",
            topics: Topics
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            meesage: "Something went wrong"
        }, { status: 500 })
    }
}

export const deleteTopic = async (req, id) => {
    try {
        await connect()
        const Topic = await topic.findById(id)

        if (!Topic) {
            return NextResponse.json({
                success: false,
                message: "Topic is not found"
            }, { status: 404 })
        }

        const oldImage = Topic.image?.public_id

        if (oldImage) {
            await deleteFile(oldImage, "image")
        }

        await Topic.deleteOne()

        return NextResponse.json({
            success: true,
            message: "Topic is deleted"
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const chapterByTopics = async (req, id) => {
    try {
        await connect()
        const Topics = await topic.find({ chapter: id })

        if (!Topics || Topics.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Topics not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Topic is found",
            topics: Topics
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const createOrUpdateImage = async (req, id) => {
    try {
        await connect()
        const Topic = await topic.findById(id)

        if (!Topic) {
            return NextResponse.json({
                success: false,
                message: "Topic is not found"
            }, { status: 404 })
        }

        const file = await req.blob()

        if (!file || file.size === 0) {
            return NextResponse.json({
                success: false,
                message: "Plz upload the file"
            }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                message: "file size should not be grater than 5MB"
            }, { status: 400 })
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({
                success: false,
                message: "you can only upload image"
            }, { status: 400 })
        }

        const oldImage = Topic.image?.public_id

        const imageData = await uploadFile(
            file,
            `studies/Topic/${id}/Image`,
            "image"
        )

        if (oldImage) {
            await deleteFile(oldImage, "image")
        }

        Topic.image = {
            public_id: imageData.public_id,
            url: imageData.secure_url
        }

        await Topic.save()

        return NextResponse.json({
            success: true,
            message: "Image is uploaded"
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Somethin went wrong"
        }, { status: 500 })
    }
}