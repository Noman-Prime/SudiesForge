import { subjectByChapter } from "@/controllers/chapter"

export const GET = async (req, { params }) => {
    const { subjectId } = await params
    return subjectByChapter(req, subjectId)
}