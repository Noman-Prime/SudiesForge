import connect from "@/lib/db"
import { deleteFile } from "@/lib/upload"
import eventModel from "@/models/event"
import pastPaper from "@/models/pastpaper"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id)
}

const getValidationMessage = (error) => {
    return Object.values(error.errors || {})[0]?.message || "Please enter valid paper data"
}

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const getQuestionImageIds = (sections = []) => {
    const publicIds = []

    sections.forEach((section) => {
        section.questions?.forEach((question) => {
            const publicId = question.image?.public_id

            if (publicId) {
                publicIds.push(publicId)
            }
        })
    })

    return publicIds
}

const getPaperSummary = (paper) => {
    const sections = paper.sections || []

    const questionCount = sections.reduce((total, section) => {
        return total + (section.questions?.length || 0)
    }, 0)

    const { sections: paperSections, ...paperDetails } = paper

    return {
        ...paperDetails,
        sectionCount: paperSections.length,
        questionCount
    }
}

export const createPastPaper = async (req) => {
    try {
        await connect()

        const {
            event,
            title,
            year,
            paperCode,
            duration,
            totalMarks,
            instructions,
            sections,
            creationMethod,
            status
        } = await req.json()

        if (!event || !isValidId(event)) {
            return NextResponse.json({
                success: false,
                message: "Please select a valid event"
            }, { status: 400 })
        }

        const Event = await eventModel.exists({
            _id: event
        })

        if (!Event) {
            return NextResponse.json({
                success: false,
                message: "Selected event is not found"
            }, { status: 404 })
        }

        const paperStatus = status || "draft"

        const Paper = await pastPaper.create({
            event,
            title,
            year,
            paperCode,
            duration,
            totalMarks,
            instructions,
            sections,
            creationMethod: creationMethod || "manual",
            status: paperStatus,
            publishedAt: paperStatus === "published" ? new Date() : null
        })

        await Paper.populate("event", "name")

        return NextResponse.json({
            success: true,
            message: paperStatus === "published"
                ? "Past paper is created and published"
                : "Past paper is saved as draft",
            pastPaper: Paper
        }, { status: 201 })
    } catch (error) {
        console.log(error)

        if (error.name === "ValidationError") {
            return NextResponse.json({
                success: false,
                message: getValidationMessage(error)
            }, { status: 400 })
        }

        if (error.name === "CastError") {
            return NextResponse.json({
                success: false,
                message: "Please enter valid paper data"
            }, { status: 400 })
        }

        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: "This past paper already exists"
            }, { status: 409 })
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const updatePastPaper = async (req, id) => {
    try {
        await connect()

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid past paper ID"
            }, { status: 400 })
        }

        const Paper = await pastPaper.findById(id)

        if (!Paper) {
            return NextResponse.json({
                success: false,
                message: "Past paper is not found"
            }, { status: 404 })
        }

        const {
            event,
            title,
            year,
            paperCode,
            duration,
            totalMarks,
            instructions,
            sections,
            creationMethod,
            status
        } = await req.json()

        if (event !== undefined) {
            if (!isValidId(event)) {
                return NextResponse.json({
                    success: false,
                    message: "Please select a valid event"
                }, { status: 400 })
            }

            const Event = await eventModel.exists({
                _id: event
            })

            if (!Event) {
                return NextResponse.json({
                    success: false,
                    message: "Selected event is not found"
                }, { status: 404 })
            }
        }

        const oldImageIds = getQuestionImageIds(Paper.sections)

        if (event !== undefined) {
            Paper.event = event
        }

        if (title !== undefined) {
            Paper.title = title
        }

        if (year !== undefined) {
            Paper.year = year
        }

        if (paperCode !== undefined) {
            Paper.paperCode = paperCode
        }

        if (duration !== undefined) {
            Paper.duration = duration
        }

        if (totalMarks !== undefined) {
            Paper.totalMarks = totalMarks
        }

        if (instructions !== undefined) {
            Paper.instructions = instructions
        }

        if (sections !== undefined) {
            Paper.sections = sections
        }

        if (creationMethod !== undefined) {
            Paper.creationMethod = creationMethod
        }

        if (status !== undefined) {
            Paper.status = status

            if (status === "published") {
                Paper.publishedAt = Paper.publishedAt || new Date()
            } else {
                Paper.publishedAt = null
            }
        }

        await Paper.save()

        const newImageIds = new Set(
            getQuestionImageIds(Paper.sections)
        )

        const removedImageIds = oldImageIds.filter((publicId) => {
            return !newImageIds.has(publicId)
        })

        await Promise.allSettled(
            removedImageIds.map((publicId) => {
                return deleteFile(publicId, "image")
            })
        )

        await Paper.populate("event", "name")

        return NextResponse.json({
            success: true,
            message: Paper.status === "published"
                ? "Past paper is updated and published"
                : "Past paper is updated",
            pastPaper: Paper
        }, { status: 200 })
    } catch (error) {
        console.log(error)

        if (error.name === "ValidationError") {
            return NextResponse.json({
                success: false,
                message: getValidationMessage(error)
            }, { status: 400 })
        }

        if (error.name === "CastError") {
            return NextResponse.json({
                success: false,
                message: "Please enter valid paper data"
            }, { status: 400 })
        }

        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: "This past paper already exists"
            }, { status: 409 })
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getPastPaper = async (req, id, includeDraft = false) => {
    try {
        await connect()

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid past paper ID"
            }, { status: 400 })
        }

        const filter = {
            _id: id
        }

        if (!includeDraft) {
            filter.status = "published"
        }

        const Paper = await pastPaper
            .findOne(filter)
            .populate("event", "name")
            .lean()

        if (!Paper) {
            return NextResponse.json({
                success: false,
                message: "Past paper is not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Past paper is found",
            pastPaper: Paper
        }, { status: 200 })
    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const getAllPastPapers = async (req, includeDrafts = false) => {
    try {
        await connect()

        const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams

        const search = searchParams.get("search")?.trim() || ""
        const event = searchParams.get("event") || ""
        const year = searchParams.get("year") || ""
        const status = searchParams.get("status") || ""

        const filter = {}

        if (!includeDrafts) {
            filter.status = "published"
        } else if (["draft", "published"].includes(status)) {
            filter.status = status
        }

        if (event) {
            if (!isValidId(event)) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid event ID"
                }, { status: 400 })
            }

            filter.event = event
        }

        if (year) {
            const paperYear = Number(year)

            if (!Number.isInteger(paperYear)) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid paper year"
                }, { status: 400 })
            }

            filter.year = paperYear
        }

        if (search) {
            const searchValue = new RegExp(
                escapeRegex(search),
                "i"
            )

            filter.$or = [
                {
                    title: searchValue
                },
                {
                    paperCode: searchValue
                }
            ]
        }

        const Papers = await pastPaper
            .find(filter)
            .populate("event", "name")
            .sort({
                year: -1,
                createdAt: -1
            })
            .lean()

        if (!Papers || Papers.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No past papers are found",
                pastPapers: []
            }, { status: 404 })
        }

        const paperSummaries = Papers.map((paper) => {
            return getPaperSummary(paper)
        })

        return NextResponse.json({
            success: true,
            message: "Past papers are found",
            pastPapers: paperSummaries
        }, { status: 200 })
    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const eventByPastPapers = async (req, eventId) => {
    try {
        await connect()

        if (!isValidId(eventId)) {
            return NextResponse.json({
                success: false,
                message: "Invalid event ID"
            }, { status: 400 })
        }

        const Event = await eventModel
            .findById(eventId)
            .select("name")
            .lean()

        if (!Event) {
            return NextResponse.json({
                success: false,
                message: "Event is not found"
            }, { status: 404 })
        }

        const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams
        const year = searchParams.get("year") || ""

        const filter = {
            event: eventId,
            status: "published"
        }

        if (year) {
            const paperYear = Number(year)

            if (!Number.isInteger(paperYear)) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid paper year"
                }, { status: 400 })
            }

            filter.year = paperYear
        }

        const Papers = await pastPaper
            .find(filter)
            .sort({
                year: -1,
                createdAt: -1
            })
            .lean()

        if (!Papers || Papers.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No past papers are found for this event",
                event: Event,
                pastPapers: []
            }, { status: 404 })
        }

        const paperSummaries = Papers.map((paper) => {
            return getPaperSummary(paper)
        })

        return NextResponse.json({
            success: true,
            message: "Past papers are found",
            event: Event,
            pastPapers: paperSummaries
        }, { status: 200 })
    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}

export const deletePastPaper = async (req, id) => {
    try {
        await connect()

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid past paper ID"
            }, { status: 400 })
        }

        const Paper = await pastPaper.findById(id)

        if (!Paper) {
            return NextResponse.json({
                success: false,
                message: "Past paper is not found"
            }, { status: 404 })
        }

        const imageIds = getQuestionImageIds(Paper.sections)

        for (const publicId of imageIds) {
            await deleteFile(publicId, "image")
        }

        await Paper.deleteOne()

        return NextResponse.json({
            success: true,
            message: "Past paper is deleted"
        }, { status: 200 })
    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}