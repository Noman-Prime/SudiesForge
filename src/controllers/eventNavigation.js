import connect from "@/lib/db";
import chapter from "@/models/chapter";
import event from "@/models/event";
import mcqs from "@/models/mcqs";
import subject from "@/models/subjects";
import topic from "@/models/topic";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const eventNavigation = async (req, id) => {
    try {
        await connect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid event ID",
            }, { status: 400 });
        }

        const Event = await event.findById(id).select("name").lean();

        if (!Event) {
            return NextResponse.json({
                success: false,
                message: "Event is not found",
            }, { status: 404 });
        }

        const Subjects = await subject.find({ event: Event._id }).select("_id").lean();
        const subjectIds = Subjects.map((item) => item._id);

        const Chapters = subjectIds.length > 0
            ? await chapter.find({ subject: { $in: subjectIds } }).select("_id").lean()
            : [];

        const chapterIds = Chapters.map((item) => item._id);

        const [topicCount, mcqCount] = await Promise.all([
            chapterIds.length > 0
                ? topic.countDocuments({ chapter: { $in: chapterIds } })
                : 0,
            mcqs.countDocuments({ event: Event._id }),
        ]);

        const collection = [
            {
                key: "subjects",
                name: "Subjects",
                count: Subjects.length,
            },
            {
                key: "chapters",
                name: "Chapters",
                count: Chapters.length,
            },
            {
                key: "topics",
                name: "Topics",
                count: topicCount,
            },
            {
                key: "mcqs",
                name: "MCQs",
                count: mcqCount,
            },
        ].filter((item) => item.count > 0);

        return NextResponse.json({
            success: true,
            eventName: Event.name,
            collection,
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};