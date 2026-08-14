import { readMcqs } from "@/controllers/mcqs"

export const GET = async (req, { params }) => {
    const { level, id } = await params
    return readMcqs(req, level, id)
}