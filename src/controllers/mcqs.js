import connect from "@/lib/db"
import mcqs from "@/models/mcqs"
import topicModel from "@/models/topic"
import "@/models/chapter"
import "@/models/subjects"
import "@/models/event"
import { NextResponse } from "next/server"

export const createMcq = async (req) => {
    try {
        await connect()

        const {
            topic,
            statement,
            options,
            explanation,
            mcqType
        } = await req.json()

        const Topic = await topicModel
            .findById(topic)
            .populate({
                path: "chapter",
                populate: {
                    path: "subject",
                    populate: {
                        path: "event"
                    }
                }
            })

        if (!Topic) {
            return NextResponse.json({
                success: false,
                message: "Topic is not found"
            }, { status: 404 })
        }

        if (
            !Topic.chapter ||
            !Topic.chapter.subject ||
            !Topic.chapter.subject.event
        ) {
            return NextResponse.json({
                success: false,
                message: "Topic hierarchy is incomplete"
            }, { status: 400 })
        }

        const Chapter = Topic.chapter
        const Subject = Chapter.subject
        const Event = Subject.event

        const Mcq = await mcqs.create({
            event: Event._id,
            subject: Subject._id,
            chapter: Chapter._id,
            topic: Topic._id,
            statement,
            options,
            explanation,
            mcqType
        })

        return NextResponse.json({
            success: true,
            message: "MCQ is created",
            mcq: Mcq
        }, { status: 201 })

    } catch (error) {
        console.log(error)

        if (error.name === "ValidationError") {
            return NextResponse.json({
                success: false,
                message:
                    Object.values(
                        error.errors
                    )[0]?.message
            }, { status: 400 })
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const updateMcq = async (req, id) => {
    try {
        await connect()

        const {
            topic,
            statement,
            options,
            explanation,
            mcqType
        } = await req.json()

        const Topic = await topicModel
            .findById(topic)
            .populate({
                path: "chapter",
                populate: {
                    path: "subject",
                    populate: {
                        path: "event"
                    }
                }
            })

        if (!Topic) {
            return NextResponse.json({
                success: false,
                message: "Topic is not found"
            }, { status: 404 })
        }

        if (
            !Topic.chapter ||
            !Topic.chapter.subject ||
            !Topic.chapter.subject.event
        ) {
            return NextResponse.json({
                success: false,
                message: "Topic hierarchy is incomplete"
            }, { status: 400 })
        }

        const Chapter = Topic.chapter
        const Subject = Chapter.subject
        const Event = Subject.event

        const Mcq =
            await mcqs.findByIdAndUpdate(
                id,
                {
                    event: Event._id,
                    subject: Subject._id,
                    chapter: Chapter._id,
                    topic: Topic._id,
                    statement,
                    options,
                    explanation,
                    mcqType
                },
                {
                    new: true,
                    runValidators: true
                }
            )

        if (!Mcq) {
            return NextResponse.json({
                success: false,
                message: "MCQ is not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "MCQ is updated",
            mcq: Mcq
        }, { status: 200 })

    } catch (error) {
        console.log(error)

        if (error.name === "ValidationError") {
            return NextResponse.json({
                success: false,
                message:
                    Object.values(
                        error.errors
                    )[0]?.message
            }, { status: 400 })
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getMcq = async (req, id) => {
    try {
        await connect()

        const Mcq = await mcqs
            .findById(id)
            .populate("event")
            .populate("subject")
            .populate("chapter")
            .populate("topic")

        if (!Mcq) {
            return NextResponse.json({
                success: false,
                message: "MCQ is not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "MCQ is found",
            mcq: Mcq
        }, { status: 200 })

    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getAllMcqs = async (req) => {
    try {
        await connect()

        const Mcqs = await mcqs
            .find()
            .populate("event")
            .populate("subject")
            .populate("chapter")
            .populate("topic")
            .sort({ createdAt: -1 })

        if (!Mcqs || Mcqs.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No MCQs are found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "MCQs are found",
            mcqs: Mcqs
        }, { status: 200 })

    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const deleteMcq = async (req, id) => {
    try {
        await connect()

        const Mcq = await mcqs.findById(id)

        if (!Mcq) {
            return NextResponse.json({
                success: false,
                message: "MCQ is not found"
            }, { status: 404 })
        }

        await Mcq.deleteOne()

        return NextResponse.json({
            success: true,
            message: "MCQ is deleted"
        }, { status: 200 })

    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const readMcqs = async (
    req,
    level,
    id
) => {
    try {
        await connect()

        const allowedLevels = [
            "event",
            "subject",
            "chapter",
            "topic"
        ]

        if (!allowedLevels.includes(level)) {
            return NextResponse.json({
                success: false,
                message: "MCQ level is invalid"
            }, { status: 400 })
        }

        const Mcqs = await mcqs
            .find({
                [level]: id,
                mcqType: {
                    $in: ["read", "both"]
                }
            })
            .sort({ createdAt: 1 })

        if (!Mcqs || Mcqs.length === 0) {
            return NextResponse.json({
                success: false,
                message:
                    "No reading MCQs are found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Reading MCQs are found",
            mcqs: Mcqs
        }, { status: 200 })

    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const testMcqs = async (
    req,
    level,
    id
) => {
    try {
        await connect()

        const allowedLevels = [
            "event",
            "subject",
            "chapter",
            "topic"
        ]

        if (!allowedLevels.includes(level)) {
            return NextResponse.json({
                success: false,
                message: "MCQ level is invalid"
            }, { status: 400 })
        }

        const Mcqs = await mcqs
            .find({
                [level]: id,
                mcqType: {
                    $in: ["test", "both"]
                }
            })
            .select(
                "-options.isCorrect -explanation"
            )
            .sort({ createdAt: 1 })

        if (!Mcqs || Mcqs.length === 0) {
            return NextResponse.json({
                success: false,
                message:
                    "No test MCQs are found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Test MCQs are found",
            mcqs: Mcqs
        }, { status: 200 })

    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const submitMcqTest = async (req) => {
    try {
        await connect()

        const { answers } = await req.json()

        if (
            !Array.isArray(answers) ||
            answers.length === 0
        ) {
            return NextResponse.json({
                success: false,
                message: "Test answers are required"
            }, { status: 400 })
        }

        const mcqIds = answers.map(
            (answer) => answer.mcqId
        )

        const TestMcqs = await mcqs.find({
            _id: {
                $in: mcqIds
            },
            mcqType: {
                $in: ["test", "both"]
            }
        })

        const mcqMap = new Map(
            TestMcqs.map((item) => [
                item._id.toString(),
                item
            ])
        )

        const results = answers.map(
            (answer) => {
                const Mcq = mcqMap.get(
                    String(answer.mcqId)
                )

                if (!Mcq) {
                    return {
                        mcqId: answer.mcqId,
                        selectedOption:
                            answer.selectedOption,
                        isCorrect: false,
                        correctOption: null,
                        correctAnswer: null,
                        explanation: ""
                    }
                }

                const correctOption =
                    Mcq.options.findIndex(
                        (option) =>
                            option.isCorrect
                    )

                const isCorrect =
                    Number.isInteger(
                        answer.selectedOption
                    ) &&
                    answer.selectedOption ===
                    correctOption

                return {
                    mcqId: Mcq._id,
                    statement: Mcq.statement,
                    selectedOption:
                        answer.selectedOption,
                    correctOption,
                    correctAnswer:
                        Mcq.options[
                            correctOption
                        ]?.text,
                    isCorrect,
                    explanation:
                        Mcq.explanation || ""
                }
            }
        )

        const correctAnswers =
            results.filter(
                (result) =>
                    result.isCorrect
            ).length

        const totalQuestions =
            results.length

        const wrongAnswers =
            totalQuestions - correctAnswers

        const percentage = Math.round(
            (correctAnswers /
                totalQuestions) *
            100
        )

        return NextResponse.json({
            success: true,
            message: "Test is submitted",
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            percentage,
            results
        }, { status: 200 })

    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}