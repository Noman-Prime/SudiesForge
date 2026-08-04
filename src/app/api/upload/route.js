import { generateUpload } from "@/controllers/upload"
import { isAdmin, isAuthenticated } from "@/lib/auth"
import { generateKey } from "crypto"
import { NextResponse } from "next/server"

const uploadType = {
    profileImage: {
        folder: "studiesforge/Users",
        resourceType: "image",
        adminOnly: false
    },
    lectureImage: {
        folder: "studiesforge/Lecture/images",
        resourceType: "image",
        adminOnly: true
    },
    lectureVideos: {
        folder: "studiesforge/Lecture/videros",
        resourceType: "video",
        adminOnly: true
    }
}

export const POST = async (req) => {
    try {
        const auth = await isAuthenticated(req)
        if (!auth.user) {
            return auth
        }

        const { type } = await req.json()
        const seletedUpload = uploadType[type]
        if (!seletedUpload) {
            return NextResponse.json({
                success: false,
                message: "Invalid upload type"
            }, { status: 400 })
        }
        if (seletedUpload.adminOnly) {
            const adminError = isAdmin("admin")(auth.user)
            if (!adminError) {
                return adminError
            }
        }

        const upload = generateUpload(seletedUpload.folder)
        return NextResponse.json({
            ...upload,
            resourceType: seletedUpload.resourceType
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Upload generate is failed"
        }, { status: 500 })
    }

}