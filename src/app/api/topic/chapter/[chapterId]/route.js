import { chapterByTopics } from "@/controllers/topic"

export const GET = async (req, { params }) => {
    const { chapterId } = await params

    return chapterByTopics(req, chapterId)
}