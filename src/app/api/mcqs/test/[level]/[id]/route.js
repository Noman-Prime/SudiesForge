import { testMcqs } from "@/controllers/mcqs"

export const GET = async (req, { params }) => {
    const { level, id } = await params
    return testMcqs(req, level, id)
}