import connect from "@/lib/db";
import chapter from "@/models/chapter";
import event from "@/models/event";
import mcqs from "@/models/mcqs";
import subject from "@/models/subjects";
import topic from "@/models/topic";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const eventMaterials = async (req, id) => {
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

        const chapterFilter = subjectIds.length > 0
            ? { subject: { $in: subjectIds } }
            : { _id: null };

        const chapterIds = subjectIds.length > 0
            ? await chapter.distinct("_id", chapterFilter)
            : [];

        const topicFilter = chapterIds.length > 0
            ? { chapter: { $in: chapterIds } }
            : { _id: null };

        const [
            chapterCount,
            Chapters,
            topicCount,
            Topics,
            mcqCount,
            readMcqCount,
            testMcqCount,
        ] = await Promise.all([
            chapter.countDocuments(chapterFilter),

            chapter
                .find(chapterFilter)
                .populate("subject", "name")
                .sort({ updatedAt: -1 })
                .limit(8)
                .lean(),

            topic.countDocuments(topicFilter),

            topic
                .find(topicFilter)
                .populate({
                    path: "chapter",
                    select: "chapterNumber chapterName subject",
                    populate: {
                        path: "subject",
                        select: "name",
                    },
                })
                .sort({ updatedAt: -1 })
                .limit(8)
                .lean(),

            mcqs.countDocuments({
                event: Event._id,
            }),

            mcqs.countDocuments({
                event: Event._id,
                mcqType: {
                    $in: ["read", "both"],
                },
            }),

            mcqs.countDocuments({
                event: Event._id,
                mcqType: {
                    $in: ["test", "both"],
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            eventName: Event.name,
            chapters: {
                count: chapterCount,
                items: Chapters,
            },
            topics: {
                count: topicCount,
                items: Topics,
            },
            mcqs: {
                count: mcqCount,
                readCount: readMcqCount,
                testCount: testMcqCount,
            },
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};