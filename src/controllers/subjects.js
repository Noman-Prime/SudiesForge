import connect from "@/lib/db"
import { deleteFile, uploadFile } from "@/lib/upload"
import subject from "@/models/subjects"
import { NextResponse } from "next/server"

export const createSubject = async (req) => {
    try {
        await connect()
        const { event, name } = await req.json()
        const Subject = await subject.create({ event, name })
        if (!Subject) {
            return NextResponse.json({
                success: false,
                message: "Subject is not created"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "Subject is created"
        }, { status: 201 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const updateSubject = async (req, id) => {
    try {
        await connect()
        const { event, name } = await req.json()
        const Subject = await subject.findByIdAndUpdate(id, { event, name }, { new: true, runValidators: true })
        if (!Subject) {
            return NextResponse.json({
                success: false,
                message: "Subject is not updated"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: truee,
            message: "Subject is updated",
            subject: Subject
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getSubject = async (req, id) => {
    try {
        await connect()
        const Subject = await subject.findById(id)
        if (!Subject) {
            return NextResponse.json({
                success: false,
                message: "Subject is not found"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "Subject is found",
            subject: Subject
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getAllSubject = async (req) => {
    try {
        await connect()
        const Subjects = await subject.find().populate("event")
        if (!Subjects || Subjects.lenght === 0) {
            return NextResponse.json({
                success: false,
                message: "Subjects not found"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "Subjects found",
            subjects: Subjects
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const deleteSubject = async (req, id) => {
    try {
        await connect()
        const Subject = await subject.findByIdAndDelete(id)
        if (!Subject) {
            return NextResponse.json({
                success: false,
                message: "Subject is not deleted"
            }, { status: 400 })
        }
        const currentImage = Subject.image?.public_id
        if (currentImage) {
            await deleteFile(currentImage, "image")
        }
        return NextResponse.json({
            success: true,
            message: "Subject is deleted"
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
        const Subject = await subject.findById(id)
        if (!Subject) {
            return NextResponse.json({
                success: false,
                message: "Subject is not found"
            }, { status: 400 })
        }
        const file = await req.blob()
        if (!file || file.size === 0) {
            return NextResponse.json({
                success: false,
                message: "file is not attached"
            }, { status: 400 })
        }
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({
                success: false,
                message: "Only image files are allowed"
            }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                message: "Image must be less than 5MB",
            }, { status: 400 })
        }
        const imageData = await uploadFile(file, `studiesforge/subject/${id}/image`, "image")
        const oldImage = Subject.image?.public_id
        if (oldImage) {
            await deleteFile(oldImage, "image")
        }
        Subject.image = {
            public_id: imageData.public_id,
            url: imageData.secure_url
        }
        await Subject.save()
        return NextResponse.json({
            success: true,
            message: "Image is added",
            subject: Subject
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}