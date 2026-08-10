import { eventNavigation } from "@/controllers/eventNavigation"

export const GET = async (req, { params }) => {
    const { id } = await params

    return eventNavigation(req, id)
}