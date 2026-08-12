import connect from "@/lib/db"
import { deleteFile, uploadFile } from "@/lib/upload"
import chapter from "@/models/chapter"
import subjectModel from "@/models/subjects";
import { NextResponse } from "next/server"

export const createChapter = async (req) => {
    try {
        await connect()
        const { subject, chapterNumber, chapterName } = await req.json()
        const Chapter = await chapter.create({ subject, chapterNumber, chapterName })
        if (!Chapter) {
            return NextResponse.json({
                success: false,
                message: "Plz fill the recquired fields"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "Chapter is created",
            chapter: Chapter
        }, { status: 201 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const updateChapter = async (req, id) => {
    try {
        await connect()
        const { subject, chapterNumber, chapterName } = await req.json()
        const Chapter = await chapter.findByIdAndUpdate(id, { subject, chapterNumber, chapterName }, { new: true, runValidators: true })
        if (!Chapter) {
            return NextResponse.json({
                success: false,
                message: "No Chapter is updated"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "Chapter is updated",
            chapter: Chapter
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getChapter = async (req, id) => {
    try {
        await connect()
        const Chapter = await chapter.findById(id)
        if (!Chapter) {
            return NextResponse.json({
                success: false,
                message: "No chapter is found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "chapter is found",
            chapter: Chapter
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getAllChapter = async (req) => {
    try {
        await connect()
        const Chapters = await chapter.find().populate("subject")
        if (!Chapters || Chapters.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No chapter is found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "chapter is found",
            chapters: Chapters
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const deleteChapter = async (req, id) => {
    try {
        await connect()
        const Chapter = await chapter.findById(id)
        if (!Chapter) {
            return NextResponse.json({
                success: false,
                message: "Chapter is not found"
            }, { status: 404 })
        }
        const oldImage = Chapter.image?.public_id
        if (oldImage) {
            await deleteFile(oldImage, "image")
        }
        await Chapter.deleteOne()
        return NextResponse.json({
            success: true,
            message: "Chapter is Deleted"
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const subjectByChapter = async (req, id) => {
    try {
        await connect()
        const Chapters = await chapter.find({ subject: id })
        if (!Chapters || Chapters.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No chapter is found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "chapters are found",
            chapters: Chapters
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
        await connect();

        const Chapter = await chapter.findById(id);

        if (!Chapter) {
            return NextResponse.json({
                success: false,
                message: "Chapter is not found",
            }, { status: 404 });
        }

        const oldImage = Chapter.image?.public_id;
        const file = await req.blob();

        if (!file || file.size === 0) {
            return NextResponse.json({
                success: false,
                message: "Image is required to upload",
            }, { status: 400 });
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({
                success: false,
                message: "Only image files are allowed",
            }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                message: "Upload an image with a maximum size of 5MB",
            }, { status: 400 });
        }

        const imageData = await uploadFile(
            file,
            `studiesforge/chapter/${id}/image`,
            "image",
        );

        if (oldImage) {
            await deleteFile(oldImage, "image");
        }

        Chapter.image = {
            public_id: imageData.public_id,
            url: imageData.secure_url,
        };

        await Chapter.save();

        return NextResponse.json({
            success: true,
            message: "Image is uploaded",
            chapter: Chapter,
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};