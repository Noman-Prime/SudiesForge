import connect from "@/lib/db"
import { deleteFile, uploadFile } from "@/lib/upload"
import slider from "@/models/slider"
import { NextResponse } from "next/server"

export const createSlider = async (req) => {
    try {
        await connect()
        const formData = await req.formData()

        const type = formData.get("type")
        const heading = formData.get("heading")
        const description = formData.get("description")
        const highlightedText = formData.get("highlightedText")
        const file = formData.get("image")
        const order = formData.get("order")
        const active = formData.get("active")
        let upload = null
        if (type === "withImage") {
            if (!file) {
                return NextResponse.json({
                    success: false,
                    message: "Image is recquired"
                }, { status: 400 })
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({
                    success: false,
                    message: "Image size should be less than 5MB"
                }, { status: 400 })
            }
            upload = await uploadFile(file, "Studiesforge/Slider/image", "image")
        }

        const data = {
            type,
            heading,
            description,
            highlightedText,
            order,
            active,
        }
        if (upload) {
            data.image = {
                public_id: upload.public_id,
                url: upload.secure_url
            }
        }
        const Slider = await slider.create(data)
        if (!Slider) {
            return NextResponse.json({
                success: false,
                message: "Slider is not create"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "Slider is created",
            slider: Slider
        }, { status: 201 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went Wrong"
        }, { status: 500 })
    }
}

export const updateSlider = async (req, id) => {
    try {
        await connect()
        const formData = await req.formData()
        const type = formData.get("type")
        const heading = formData.get("heading")
        const description = formData.get("description")
        const highlightedText = formData.get("highlightedText")
        const file = formData.get("image")
        const order = formData.get("order")
        const active = formData.get("active")
        let upload = null
        const Slider = await slider.findById(id)
        if (!Slider) {
            return NextResponse.json({
                success: false,
                message: "no slider is found"
            }, { status: 400 })
        }
        const oldImage = Slider.image?.public_id
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({
                    success: false,
                    message: "Image size should be less than 5MB"
                }, { status: 400 })
            }
            if (oldImage) {
                await deleteFile(oldImage, "image")
            }

            upload = await uploadFile(file, "Studiesforge/Slider/image", "image")
        }

        const data = {
            type,
            heading,
            description,
            highlightedText,
            order,
            active,
        }
        if (upload) {
            data.image = {
                public_id: upload.public_id,
                url: upload.secure_url
            }
        }
        const updated = await slider.findByIdAndUpdate(id, data, { runValidators: true, new: true })
        if (!updated) {
            return NextResponse.json({
                success: false,
                message: "Slider is not updated"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "Slider is created",
            slider: updated
        }, { status: 201 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went Wrong"
        }, { status: 500 })
    }
}

export const getSlider = async (req, id) => {
    try {
        await connect()
        const Slider = await slider.findById(id)
        if (!Slider) {
            return NextResponse.json({
                success: false,
                message: "Slider is not found"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "Slider is found",
            slider: Slider
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const allSlider = async (req) => {
    try {
        await connect()
        const Sliders = await slider.find()
        if (!Sliders || Sliders.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Sliders not found"
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true,
            message: "Sliders are found",
            sliders: Sliders
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const deleteSlider = async (req, id) => {
    try {
        await connect()
        const Slider = await slider.findById(id)
        if (!Slider) {
            return NextResponse.json({
                success: false,
                message: "No slider is found"
            }, { status: 400 })
        }
        const imageId = Slider.image?.public_id
        if (imageId) {
            await deleteFile(imageId, "image")
        }
        await slider.findByIdAndDelete(id)
        return NextResponse.json({
            success: true,
            message: "Slider is deleted"
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}