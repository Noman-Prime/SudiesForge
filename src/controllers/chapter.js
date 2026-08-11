import connect from "@/lib/db"
import chapter from "@/models/chapter"
import { NextResponse } from "next/server"

export const createChapter = async (req) => {
    try {
        await connect()
        const { subject, chapterNumber, chapterName } = await req.json
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