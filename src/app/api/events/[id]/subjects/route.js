import { subjectByEvent } from "@/controllers/subjects"

export const GET = async (_req, { params }) => {
    const { id } = await params
    return subjectByEvent(_req, id)
}